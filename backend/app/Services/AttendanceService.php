<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\PkkmbSession;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Pencatatan presensi yang idempoten dan ringan untuk lonjakan trafik.
 */
class AttendanceService
{
    public function __construct(private GamificationService $gamification) {}

    /** Data sesi di-cache 60 detik agar 8.000 request tidak memukul DB untuk baca sesi. */
    public function findSession(int $id): ?PkkmbSession
    {
        return Cache::remember("session:{$id}", 60, fn () => PkkmbSession::find($id));
    }

    /**
     * @throws ValidationException
     */
    public function record(User $user, PkkmbSession $session, string $method, ?float $lat = null, ?float $lng = null, ?int $scannedBy = null): Attendance
    {
        if (! $session->attendance_open && $method !== 'MANUAL') {
            throw ValidationException::withMessages(['token' => 'Presensi untuk sesi ini belum/tidak dibuka.']);
        }
        if ($session->batch && $user->batch && $session->batch !== $user->batch) {
            throw ValidationException::withMessages(['token' => 'Sesi ini bukan untuk batch kamu.']);
        }
        if ($session->faculty_id && $session->faculty_id !== $user->faculty_id) {
            throw ValidationException::withMessages(['token' => 'Sesi ini khusus fakultas lain.']);
        }

        // Geofence opsional (hanya presensi mandiri via QR)
        if ($method === 'QR' && $session->radius_m && $session->latitude && $session->longitude) {
            if ($lat === null || $lng === null) {
                throw ValidationException::withMessages(['location' => 'Aktifkan izin lokasi untuk presensi sesi ini.']);
            }
            $distance = Geo::distanceMeters($lat, $lng, $session->latitude, $session->longitude);
            if ($distance > $session->radius_m) {
                throw ValidationException::withMessages(['location' => sprintf('Kamu berada %d m dari lokasi sesi (maks %d m).', $distance, $session->radius_m)]);
            }
        }

        $status = now()->gt($session->starts_at->copy()->addMinutes(15)) ? 'TERLAMBAT' : 'HADIR';

        // insertOrIgnore + UNIQUE(session_id,user_id) → aman dari double submit & race condition
        $inserted = DB::table('attendances')->insertOrIgnore([
            'session_id' => $session->id,
            'user_id' => $user->id,
            'method' => $method,
            'status' => $status,
            'latitude' => $lat,
            'longitude' => $lng,
            'scanned_by' => $scannedBy,
            'created_at' => now(),
        ]);

        $attendance = Attendance::where('session_id', $session->id)->where('user_id', $user->id)->firstOrFail();

        if ($inserted) {
            $this->gamification->afterAttendance($user, $session);
        }
        $attendance->setAttribute('was_new', (bool) $inserted);

        return $attendance;
    }
}
