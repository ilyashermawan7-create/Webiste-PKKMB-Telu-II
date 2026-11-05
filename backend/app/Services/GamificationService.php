<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Poin, badge, dan misi harian. Dipanggil setelah aksi maba (presensi, tugas, kuis).
 */
class GamificationService
{
    public function addPoints(User $user, int $points): void
    {
        if ($points > 0) {
            User::whereKey($user->id)->increment('points', $points);
        }
    }

    /** Beri badge bila belum dimiliki. Mengembalikan true jika baru diberikan. */
    public function award(User $user, string $code): bool
    {
        $badge = Badge::where('code', $code)->first();
        if (! $badge) {
            return false;
        }
        $inserted = DB::table('badge_user')->insertOrIgnore([
            'badge_id' => $badge->id, 'user_id' => $user->id, 'awarded_at' => now(),
        ]);
        if ($inserted) {
            $this->addPoints($user, $badge->points);
        }

        return (bool) $inserted;
    }

    /** Tandai misi hari ini dengan aksi tertentu sebagai selesai. */
    public function completeMission(User $user, string $action): void
    {
        $missions = Mission::whereDate('date', today())->where('action', $action)->get();
        foreach ($missions as $mission) {
            $inserted = DB::table('mission_user')->insertOrIgnore([
                'mission_id' => $mission->id, 'user_id' => $user->id, 'completed_at' => now(),
            ]);
            if ($inserted) {
                $this->addPoints($user, $mission->points);
            }
        }
    }

    /** Evaluasi badge berbasis aturan setelah presensi. */
    public function afterAttendance(User $user, \App\Models\PkkmbSession $session): void
    {
        $this->addPoints($user, $session->points);
        $this->completeMission($user, 'ATTEND');

        // Early Bird: presensi dalam 10 menit pertama sejak sesi dibuka
        if (now()->lte($session->starts_at->copy()->addMinutes(10))) {
            $this->award($user, 'EARLY_BIRD');
        }
        $count = $user->attendances()->count();
        if ($count >= 1) {
            $this->award($user, 'FIRST_STEP');
        }
        if ($count >= 5) {
            $this->award($user, 'KONSISTEN');
        }
    }

    /** Leaderboard per gugus (bukan individu) — total & rata-rata poin anggota. */
    public function groupLeaderboard(int $limit = 20, ?int $facultyId = null): array
    {
        return DB::table('groups')
            ->leftJoin('users', fn ($j) => $j->on('users.group_id', '=', 'groups.id')->where('users.role', 'MABA'))
            ->leftJoin('faculties', 'faculties.id', '=', 'groups.faculty_id')
            ->when($facultyId, fn ($q) => $q->where('groups.faculty_id', $facultyId))
            ->groupBy('groups.id', 'groups.code', 'groups.name', 'faculties.code')
            ->selectRaw('groups.id, groups.code, groups.name, faculties.code as faculty_code, COUNT(users.id) as members, COALESCE(SUM(users.points),0) as total_points, COALESCE(ROUND(AVG(users.points)),0) as avg_points')
            ->orderByDesc('avg_points')
            ->limit($limit)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id, 'code' => $r->code, 'name' => $r->name, 'faculty_code' => $r->faculty_code,
                'members' => (int) $r->members, 'total_points' => (int) $r->total_points, 'avg_points' => (int) $r->avg_points,
            ])->all();
    }
}
