<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\PkkmbSession;
use App\Models\User;
use App\Services\GamificationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/** Aktivitas contoh (presensi Pre-PKKMB & pengumpulan tugas) agar dashboard/analitik terisi. */
class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $pre = PkkmbSession::where('type', 'PRE')->first();
        $essay = Assignment::where('type', 'FILE')->first();
        $mentor = User::where('email', 'mentor@pkkmb.telkomuniversity.ac.id')->first();
        $game = app(GamificationService::class);

        User::where('role', 'MABA')->orderBy('id')->get()->each(function (User $u, int $i) use ($pre, $essay, $mentor, $game) {
            if ($i % 10 < 8 && $pre) { // ±80% hadir Pre-PKKMB
                $ok = DB::table('attendances')->insertOrIgnore([
                    'session_id' => $pre->id, 'user_id' => $u->id, 'method' => 'CODE', 'status' => 'HADIR',
                    'created_at' => $pre->starts_at->copy()->addMinutes($i % 25),
                ]);
                if ($ok) {
                    $game->addPoints($u, $pre->points);
                    $game->award($u, 'FIRST_STEP');
                }
            }
            if ($i % 3 === 0 && $essay) {
                $graded = $i % 6 === 0;
                DB::table('submissions')->insertOrIgnore([
                    'assignment_id' => $essay->id, 'user_id' => $u->id, 'text' => null, 'url' => null, 'file_path' => null,
                    'status' => $graded ? 'GRADED' : 'SUBMITTED', 'score' => $graded ? 70 + ($i % 30) : null,
                    'feedback' => $graded ? 'Esai sudah baik, perjelas kontribusi konkretmu.' : null,
                    'graded_by' => $graded ? $mentor?->id : null, 'submitted_at' => now()->subHours($i % 48), 'graded_at' => $graded ? now() : null,
                ]);
            }
        });
    }
}
