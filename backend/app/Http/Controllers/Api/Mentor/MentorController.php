<?php

namespace App\Http\Controllers\Api\Mentor;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\GroupResource;
use App\Http\Resources\SubmissionResource;
use App\Models\Announcement;
use App\Models\Group;
use App\Models\PkkmbSession;
use App\Models\Submission;
use App\Models\User;
use App\Services\AttendanceService;
use App\Services\GamificationService;
use App\Services\QrTokenService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

/** Fitur mentor & panitia lapangan. */
class MentorController extends Controller
{
    /** Gugus yang boleh diakses user: mentor → bimbingannya; panitia/admin → semua (atau ?group_id). */
    private function groupsQuery(Request $request): Builder
    {
        $user = $request->user();

        return Group::query()
            ->when($user->role === Role::MENTOR, fn ($q) => $q->where('mentor_id', $user->id))
            ->when($request->integer('group_id'), fn ($q, $id) => $q->whereKey($id));
    }

    public function groups(Request $request)
    {
        return GroupResource::collection($this->groupsQuery($request)->with('faculty:id,code,name')->withCount('members')->get());
    }

    /** Anggota gugus + rekap presensi & tugas. */
    public function group(Request $request, Group $group): JsonResponse
    {
        abort_unless($this->groupsQuery($request)->whereKey($group->id)->exists(), 403, 'Bukan gugus bimbinganmu.');

        $members = $group->members()->with('studyProgram:id,name')->orderBy('name')->get();
        $ids = $members->pluck('id');
        $sessions = PkkmbSession::where(fn ($q) => $q->whereNull('batch')->orWhere('batch', $group->batch))
            ->where(fn ($q) => $q->whereNull('faculty_id')->orWhere('faculty_id', $group->faculty_id))
            ->where('starts_at', '<=', now())->orderBy('starts_at')->get(['id', 'title', 'starts_at']);
        $att = DB::table('attendances')->whereIn('user_id', $ids)->whereIn('session_id', $sessions->pluck('id'))
            ->get(['user_id', 'session_id', 'status'])->groupBy('user_id');
        $subs = DB::table('submissions')->whereIn('user_id', $ids)->selectRaw('user_id, COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as graded', ['GRADED'])
            ->groupBy('user_id')->get()->keyBy('user_id');

        return response()->json(['data' => [
            'group' => new GroupResource($group->load('faculty', 'mentor')),
            'sessions' => $sessions,
            'members' => $members->map(fn (User $m) => [
                'id' => $m->id, 'nim' => $m->nim, 'name' => $m->name, 'gender' => $m->gender, 'phone' => $m->phone,
                'study_program' => $m->studyProgram?->name, 'points' => $m->points,
                'accessibility_needs' => $m->accessibility_needs,
                'attendance' => ($att[$m->id] ?? collect())->pluck('status', 'session_id'),
                'attendance_rate' => $sessions->count() ? round(($att[$m->id] ?? collect())->count() / $sessions->count(), 2) : null,
                'submissions' => (int) ($subs[$m->id]->total ?? 0),
                'graded' => (int) ($subs[$m->id]->graded ?? 0),
            ]),
        ]]);
    }

    public function submissions(Request $request)
    {
        $groupIds = $this->groupsQuery($request)->pluck('id');
        $q = Submission::with('user:id,name,nim,group_id', 'assignment:id,title,max_score')
            ->whereHas('user', fn ($u) => $u->whereIn('group_id', $groupIds))
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->latest('submitted_at');

        return SubmissionResource::collection($q->paginate(30));
    }

    public function grade(Request $request, Submission $submission, GamificationService $game): SubmissionResource
    {
        Gate::authorize('grade', $submission->load('user', 'assignment'));
        $data = $request->validate([
            'status' => 'required|in:GRADED,REVISION',
            'score' => 'required_if:status,GRADED|nullable|integer|min:0|max:'.$submission->assignment->max_score,
            'feedback' => 'nullable|string|max:2000',
        ]);
        $firstGrade = $submission->status !== 'GRADED' && $data['status'] === 'GRADED';
        $submission->update([
            'status' => $data['status'],
            'score' => $data['score'] ?? null,
            'feedback' => isset($data['feedback']) ? strip_tags($data['feedback']) : null,
            'graded_by' => $request->user()->id,
            'graded_at' => now(),
        ]);
        if ($firstGrade) {
            $game->addPoints($submission->user, $submission->assignment->points);
        }

        return new SubmissionResource($submission->fresh(['user', 'assignment']));
    }

    /** Scanner: panitia memindai QR kartu identitas maba untuk presensi sesi. */
    public function scan(Request $request, QrTokenService $qr, AttendanceService $attendance): JsonResponse
    {
        $data = $request->validate([
            'session_id' => 'required|exists:sessions_pkkmb,id',
            'card' => 'required|string|max:80',
        ]);
        $userId = $qr->verifyMemberCard($data['card']);
        if (! $userId) {
            throw ValidationException::withMessages(['card' => 'QR kartu tidak valid.']);
        }
        $maba = User::where('role', 'MABA')->findOrFail($userId);
        if ($request->user()->role === Role::MENTOR && ! $request->user()->mentoredGroups()->whereKey($maba->group_id)->exists()) {
            throw ValidationException::withMessages(['card' => 'Maba ini bukan anggota gugusmu.']);
        }
        $session = PkkmbSession::findOrFail($data['session_id']);
        $att = $attendance->record($maba, $session, 'SCAN', scannedBy: $request->user()->id);

        return response()->json(['data' => [
            'name' => $maba->name, 'nim' => $maba->nim, 'status' => $att->status, 'already' => ! $att->was_new,
        ]]);
    }

    public function announce(Request $request): AnnouncementResource
    {
        $data = $request->validate([
            'group_id' => 'required|integer',
            'title' => 'required|string|max:150',
            'body' => 'required|string|max:3000',
        ]);
        abort_unless($this->groupsQuery($request)->whereKey($data['group_id'])->exists(), 403, 'Bukan gugus bimbinganmu.');

        return new AnnouncementResource(Announcement::create([
            'title' => strip_tags($data['title']),
            'body' => strip_tags($data['body']),
            'category' => 'Gugus',
            'audience' => 'GROUP',
            'group_id' => $data['group_id'],
            'published_at' => now(),
            'author_id' => $request->user()->id,
        ]));
    }

    /** Sesi yang sedang/akan berlangsung (untuk pilihan di scanner). */
    public function activeSessions(): JsonResponse
    {
        return response()->json(['data' => PkkmbSession::whereBetween('starts_at', [now()->subDay(), now()->addDay()])->orderBy('starts_at')->get(['id', 'title', 'starts_at', 'attendance_open', 'mode'])]);
    }
}
