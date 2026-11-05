<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\QrTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** Presensi mandiri maba: QR dinamis (offline) atau kode sesi (online). */
class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $attendance) {}

    public function qr(Request $request, QrTokenService $qr): JsonResponse
    {
        $data = $request->validate([
            'token' => 'required|string|max:200',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
        ]);

        $sessionId = $qr->verify($data['token']);
        if (! $sessionId) {
            throw ValidationException::withMessages(['token' => 'QR tidak valid atau sudah kedaluwarsa. Pindai QR terbaru di layar.']);
        }
        $session = $this->attendance->findSession($sessionId) ?? abort(404);
        if ($session->mode !== 'OFFLINE') {
            throw ValidationException::withMessages(['token' => 'Sesi online memakai kode presensi.']);
        }

        return $this->respond($this->attendance->record($request->user(), $session, 'QR', $data['lat'] ?? null, $data['lng'] ?? null), $session);
    }

    public function code(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_id' => 'required|integer',
            'code' => 'required|string|max:12',
        ]);
        $session = $this->attendance->findSession($data['session_id']) ?? abort(404);
        if ($session->mode !== 'ONLINE' || ! $session->online_code || ! hash_equals(strtoupper($session->online_code), strtoupper(trim($data['code'])))) {
            throw ValidationException::withMessages(['code' => 'Kode presensi salah.']);
        }

        return $this->respond($this->attendance->record($request->user(), $session, 'CODE'), $session);
    }

    private function respond($attendance, $session): JsonResponse
    {
        return response()->json(['data' => [
            'session' => $session->title,
            'status' => $attendance->status,
            'already' => ! $attendance->was_new,
            'points' => $attendance->was_new ? $session->points : 0,
            'at' => $attendance->created_at,
        ]], $attendance->was_new ? 201 : 200);
    }
}
