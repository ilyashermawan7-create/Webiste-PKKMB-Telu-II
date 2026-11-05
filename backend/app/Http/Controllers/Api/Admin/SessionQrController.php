<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PkkmbSession;
use App\Services\QrTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/** QR dinamis untuk ditampilkan di layar sesi (refresh tiap 30 detik). */
class SessionQrController extends Controller
{
    public function show(PkkmbSession $session, QrTokenService $qr): JsonResponse
    {
        return response()->json(['data' => [
            'session_id' => $session->id,
            'title' => $session->title,
            'attendance_open' => $session->attendance_open,
            'token' => $qr->make($session->id),
            'expires_in' => $qr->secondsRemaining(),
            'attendances_count' => $session->attendances()->count(),
        ]]);
    }

    public function toggle(Request $request, PkkmbSession $session): JsonResponse
    {
        $data = $request->validate(['open' => 'required|boolean']);
        $session->update(['attendance_open' => $data['open']]);
        Cache::forget("session:{$session->id}");

        return response()->json(['data' => ['attendance_open' => $session->attendance_open]]);
    }
}
