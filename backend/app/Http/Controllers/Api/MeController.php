<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\SessionResource;
use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\Badge;
use App\Models\Mission;
use App\Models\PkkmbSession;
use App\Services\CertificateService;
use App\Services\GamificationService;
use App\Services\QrTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Data dashboard mahasiswa baru. */
class MeController extends Controller
{
    public function dashboard(Request $request, CertificateService $certs, GamificationService $game): JsonResponse
    {
        $user = $request->user()->load('group.mentor', 'faculty', 'studyProgram');

        $next = PkkmbSession::forUser($user)->where('ends_at', '>=', now())->orderBy('starts_at')->limit(3)->get();
        $pendingAssignments = Assignment::where('due_at', '>=', now())
            ->whereDoesntHave('submissions', fn ($q) => $q->where('user_id', $user->id))->count();
        $rank = collect($game->groupLeaderboard(1000))->search(fn ($g) => $g['id'] === $user->group_id);

        return response()->json(['data' => [
            'points' => $user->points,
            'badges_count' => $user->badges()->count(),
            'group_rank' => $rank === false ? null : $rank + 1,
            'pending_assignments' => $pendingAssignments,
            'certificate' => $certs->eligibility($user),
            'next_sessions' => SessionResource::collection($next),
            'missions' => $this->missionsFor($user),
            'announcements' => AnnouncementResource::collection(
                Announcement::visibleTo($user)->orderByDesc('is_pinned')->latest('published_at')->limit(5)->get()
            ),
        ]]);
    }

    public function schedule(Request $request)
    {
        $user = $request->user();
        $attended = DB::table('attendances')->where('user_id', $user->id)->pluck('session_id')->flip();
        $sessions = PkkmbSession::forUser($user)->with('faculty:id,code,name')->orderBy('starts_at')->get()
            ->each(fn ($s) => $s->attended = $attended->has($s->id));

        return SessionResource::collection($sessions);
    }

    public function announcements(Request $request)
    {
        return AnnouncementResource::collection(
            Announcement::visibleTo($request->user())->with('author:id,name')->orderByDesc('is_pinned')->latest('published_at')->paginate(20)
        );
    }

    public function gamification(Request $request, GamificationService $game): JsonResponse
    {
        $user = $request->user();
        $owned = $user->badges()->get()->keyBy('id');

        return response()->json(['data' => [
            'points' => $user->points,
            'badges' => Badge::orderBy('points')->get()->map(fn ($b) => $b->only('id', 'code', 'name', 'description', 'icon', 'points') + [
                'awarded_at' => ($at = $owned->get($b->id)?->pivot->awarded_at) ? \Illuminate\Support\Carbon::parse($at)->toIso8601String() : null,
            ]),
            'missions' => $this->missionsFor($user),
            'leaderboard' => $game->groupLeaderboard(20),
            'my_group_id' => $user->group_id,
        ]]);
    }

    /** Kartu identitas digital: data minimal + token QR bertanda tangan. */
    public function card(Request $request, QrTokenService $qr): JsonResponse
    {
        $u = $request->user()->load('faculty', 'studyProgram', 'group');

        return response()->json(['data' => [
            'name' => $u->name,
            'nim' => $u->nim,
            'faculty' => $u->faculty?->name,
            'faculty_code' => $u->faculty?->code,
            'study_program' => $u->studyProgram?->name,
            'group' => $u->group?->name,
            'batch' => $u->batch,
            'qr' => $qr->memberCardToken($u->id),
        ]]);
    }

    private function missionsFor($user)
    {
        $done = DB::table('mission_user')->where('user_id', $user->id)->pluck('mission_id')->flip();

        return Mission::whereDate('date', today())->get()->map(fn ($m) => [
            'id' => $m->id, 'title' => $m->title, 'description' => $m->description, 'points' => $m->points, 'completed' => $done->has($m->id),
        ]);
    }

    /** Selesaikan misi berbasis kunjungan (mis. membuka peta kampus / FAQ). */
    public function completeVisitMission(Request $request, GamificationService $game): JsonResponse
    {
        $data = $request->validate(['action' => 'required|in:VISIT_MAP,READ_FAQ']);
        $game->completeMission($request->user(), $data['action']);
        if ($data['action'] === 'VISIT_MAP') {
            $game->award($request->user(), 'EXPLORER');
        }

        return response()->json(['ok' => true]);
    }
}
