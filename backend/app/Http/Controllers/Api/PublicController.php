<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\SessionResource;
use App\Models\Announcement;
use App\Models\CampusPlace;
use App\Models\Certificate;
use App\Models\Faculty;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\Group;
use App\Models\Organization;
use App\Models\PkkmbSession;
use App\Models\Setting;
use App\Models\StudyProgram;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Endpoint publik (tanpa login). Semua di-cache dan TIDAK memuat data pribadi maba.
 */
class PublicController extends Controller
{
    private const PUBLIC_SETTINGS = ['theme_title', 'theme_tagline', 'year', 'event_start', 'event_end', 'teaser_video_url',
        'hotline_whatsapp', 'hotline_email', 'instagram', 'virtual_tour_url', 'rector_message', 'director_message'];

    public function settings(): JsonResponse
    {
        return response()->json(['data' => collect(Setting::allCached())->only(self::PUBLIC_SETTINGS)]);
    }

    public function stats(): JsonResponse
    {
        $data = Cache::remember('public.stats', 600, fn () => [
            'maba' => User::where('role', 'MABA')->count(),
            'faculties' => Faculty::count(),
            'study_programs' => StudyProgram::count(),
            'groups' => Group::count(),
            'organizations' => Organization::count(),
        ]);

        return response()->json(['data' => $data]);
    }

    public function sessions(Request $request)
    {
        $q = PkkmbSession::with('faculty:id,code,name')->orderBy('starts_at')
            ->when($request->integer('batch'), fn ($q, $b) => $q->where(fn ($w) => $w->whereNull('batch')->orWhere('batch', $b)))
            ->when($request->string('faculty')->toString(), fn ($q, $f) => $q->where(fn ($w) => $w->whereNull('faculty_id')->orWhereHas('faculty', fn ($x) => $x->where('code', $f))));

        return SessionResource::collection($q->get());
    }

    public function faculties(): JsonResponse
    {
        return response()->json(['data' => Faculty::with('studyPrograms:id,faculty_id,code,name,degree,accreditation')->withCount('studyPrograms')->orderBy('id')->get()]);
    }

    public function organizations(): JsonResponse
    {
        return response()->json(['data' => Organization::orderBy('category')->orderBy('name')->get()]);
    }

    public function faqs(): JsonResponse
    {
        return response()->json(['data' => Faq::orderBy('category')->orderBy('order')->get()]);
    }

    public function announcements(Request $request)
    {
        return AnnouncementResource::collection(
            Announcement::published()->where('audience', 'ALL')->with('author:id,name')
                ->orderByDesc('is_pinned')->orderByDesc('published_at')->paginate(min($request->integer('per_page', 12), 50))
        );
    }

    public function announcement(Announcement $announcement): AnnouncementResource
    {
        abort_unless($announcement->audience === 'ALL' && $announcement->published_at?->isPast(), 404);

        return new AnnouncementResource($announcement->load('author:id,name'));
    }

    public function gallery(): JsonResponse
    {
        $disk = Storage::disk(config('filesystems.public_uploads'));

        return response()->json(['data' => GalleryItem::latest('taken_at')->get()->map(fn ($g) => [
            'id' => $g->id, 'title' => $g->title, 'caption' => $g->caption, 'taken_at' => $g->taken_at?->toDateString(),
            'image_url' => Str::startsWith($g->image_path, 'http') ? $g->image_path : $disk->url($g->image_path),
        ])]);
    }

    public function places(): JsonResponse
    {
        return response()->json(['data' => CampusPlace::orderBy('category')->get()]);
    }

    /** Verifikasi sertifikat: hanya nama, fakultas, nomor & tanggal terbit. */
    public function verifyCertificate(string $hash): JsonResponse
    {
        $cert = Certificate::where('verify_hash', $hash)->with('user.faculty:id,code,name')->first();
        if (! $cert) {
            return response()->json(['data' => ['valid' => false]], 404);
        }

        return response()->json(['data' => [
            'valid' => true,
            'number' => $cert->number,
            'name' => $cert->user->name,
            'faculty' => $cert->user->faculty?->name,
            'issued_at' => $cert->issued_at->toIso8601String(),
        ]]);
    }

    /**
     * Pengaduan anonim (kekerasan/perpeloncoan). IP tidak disimpan.
     * Pelapor menerima kode + token rahasia untuk memantau status.
     */
    public function storeReport(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category' => 'required|in:PENGADUAN,KEKERASAN',
            'subject' => 'required|string|max:150',
            'body' => 'required|string|min:20|max:5000',
            'contact' => 'nullable|string|max:120',
            'website' => 'prohibited', // honeypot anti-bot
        ]);

        $token = Str::random(32);
        $ticket = Ticket::create([
            'code' => 'LPR-'.Str::upper(Str::random(8)),
            'category' => $data['category'],
            'subject' => strip_tags($data['subject']),
            'body' => strip_tags($data['body']),
            'priority' => $data['category'] === 'KEKERASAN' ? 'URGENT' : 'HIGH',
            'is_anonymous' => true,
            'status' => 'OPEN',
            'reporter_token_hash' => Hash::make($token),
            'contact' => $data['contact'] ?? null,
        ]);

        return response()->json(['data' => ['code' => $ticket->code, 'token' => $token]], 201);
    }

    public function reportStatus(Request $request, string $code): JsonResponse
    {
        $request->validate(['token' => 'required|string|size:32']);
        $ticket = Ticket::where('code', $code)->with('replies')->first();
        if (! $ticket || ! $ticket->reporter_token_hash || ! Hash::check($request->string('token'), $ticket->reporter_token_hash)) {
            return response()->json(['message' => 'Kode atau token tidak cocok.'], 404);
        }

        return response()->json(['data' => [
            'code' => $ticket->code,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at->toIso8601String(),
            'replies' => $ticket->replies->where('is_staff', true)->values()->map(fn ($r) => ['body' => $r->body, 'created_at' => $r->created_at->toIso8601String()]),
        ]]);
    }
}
