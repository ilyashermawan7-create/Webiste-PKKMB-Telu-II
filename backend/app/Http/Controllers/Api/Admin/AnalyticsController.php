<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PkkmbSession;
use App\Models\Ticket;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Cache::remember('admin.analytics', 60, fn () => $this->compute())]);
    }

    private function compute(): array
    {
        $totalMaba = User::where('role', 'MABA')->count();

        // Penyebut = maba yang menjadi peserta sesi tsb (sesuai batch/fakultas), bukan seluruh maba
        $expected = fn (PkkmbSession $s) => User::where('role', 'MABA')
            ->when($s->batch, fn ($q) => $q->where('batch', $s->batch))
            ->when($s->faculty_id, fn ($q) => $q->where('faculty_id', $s->faculty_id))->count();

        $attendance = PkkmbSession::withCount('attendances')->orderBy('starts_at')->get()->map(function ($s) use ($expected) {
            $participants = $expected($s);

            return [
                'id' => $s->id, 'title' => $s->title, 'day' => $s->day_number, 'starts_at' => $s->starts_at->toIso8601String(),
                'attended' => $s->attendances_count, 'participants' => $participants,
                'rate' => $participants ? round($s->attendances_count / $participants, 3) : 0,
            ];
        });

        $byFaculty = DB::table('users')->leftJoin('faculties', 'faculties.id', '=', 'users.faculty_id')
            ->where('users.role', 'MABA')->groupBy('faculties.code')
            ->selectRaw("COALESCE(faculties.code,'-') as faculty, COUNT(*) as total, SUM(CASE WHEN gender='L' THEN 1 ELSE 0 END) as male, SUM(CASE WHEN gender='P' THEN 1 ELSE 0 END) as female")
            ->orderBy('faculty')->get();

        $assignments = DB::table('assignments')->leftJoin('submissions', 'submissions.assignment_id', '=', 'assignments.id')
            ->groupBy('assignments.id', 'assignments.title')->orderBy('assignments.id')
            ->selectRaw("assignments.id, assignments.title, COUNT(submissions.id) as submitted, SUM(CASE WHEN submissions.status='GRADED' THEN 1 ELSE 0 END) as graded")
            ->get()->map(fn ($a) => (array) $a + ['total' => $totalMaba]);

        return [
            'totals' => [
                'maba' => $totalMaba,
                'mentors' => User::where('role', 'MENTOR')->count(),
                'attendances' => DB::table('attendances')->count(),
                'submissions' => DB::table('submissions')->count(),
                'certificates' => DB::table('certificates')->count(),
                'open_tickets' => Ticket::whereIn('status', ['OPEN', 'IN_PROGRESS'])->count(),
                'urgent_tickets' => Ticket::where('priority', 'URGENT')->whereIn('status', ['OPEN', 'IN_PROGRESS'])->count(),
            ],
            'attendance' => $attendance,
            'by_faculty' => $byFaculty,
            'assignments' => $assignments,
        ];
    }

    /** Export rekap presensi (CSV ber-BOM sehingga langsung terbuka rapi di Excel). Di-stream agar hemat memori. */
    public function exportAttendance(): StreamedResponse
    {
        $sessions = PkkmbSession::orderBy('starts_at')->get(['id', 'title', 'batch', 'faculty_id', 'ends_at']);

        return response()->streamDownload(function () use ($sessions) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, array_merge(['NIM', 'Nama', 'Fakultas', 'Gugus'], $sessions->pluck('title')->all(), ['Persentase']));
            User::where('role', 'MABA')->with('faculty:id,code', 'group:id,code')->orderBy('nim')
                ->chunkById(500, function ($users) use ($out, $sessions) {
                    $att = DB::table('attendances')->whereIn('user_id', $users->pluck('id'))->get(['user_id', 'session_id', 'status'])->groupBy('user_id');
                    foreach ($users as $u) {
                        $mine = ($att[$u->id] ?? collect())->pluck('status', 'session_id');
                        $row = [$u->nim, $u->name, $u->faculty?->code, $u->group?->code];
                        $due = 0;
                        foreach ($sessions as $s) {
                            $applies = (! $s->batch || $s->batch === $u->batch) && (! $s->faculty_id || $s->faculty_id === $u->faculty_id);
                            if (! $applies) {
                                $row[] = '-';            // bukan sesi peserta ini
                            } elseif (isset($mine[$s->id])) {
                                $row[] = $mine[$s->id];
                                $due++;
                            } elseif ($s->ends_at->isPast()) {
                                $row[] = 'ALPA';
                                $due++;
                            } else {
                                $row[] = '';             // belum berlangsung
                            }
                        }
                        $row[] = $due ? round($mine->count() / $due * 100).'%' : '-';
                        fputcsv($out, $row);
                    }
                });
            fclose($out);
        }, 'rekap-presensi-pkkmb-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function exportPdf(): Response
    {
        $data = $this->compute();

        return Pdf::loadView('pdf.analytics', ['data' => $data, 'generatedAt' => now()])->setPaper('a4')->download('laporan-pkkmb-'.now()->format('Ymd').'.pdf');
    }
}
