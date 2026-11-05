<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Pengumuman live via Server-Sent Events.
 * Koneksi dibatasi ±55 detik lalu klien (EventSource) otomatis reconnect dengan Last-Event-ID,
 * sehingga worker PHP tidak tertahan lama. Untuk skala besar bisa diganti Laravel Reverb/Pusher.
 */
class AnnouncementStreamController extends Controller
{
    public function stream(Request $request): StreamedResponse
    {
        $user = $request->user();
        $lastId = (int) ($request->header('Last-Event-ID') ?: $request->query('last_id', 0));
        if ($lastId === 0) {
            $lastId = (int) Announcement::max('id');
        }

        return response()->stream(function () use ($user, $lastId) {
            // SSE_MAX_SECONDS=0 → satu kali cek lalu tutup (klien reconnect tiap ±5 dtk = long-polling).
            // Wajib 0 untuk `php artisan serve` (single-process); 55 untuk PHP-FPM/Octane.
            $deadline = time() + (int) config('app.sse_seconds', 55);
            echo "retry: 5000\n\n";
            do {
                $items = Announcement::visibleTo($user)->where('id', '>', $lastId)->orderBy('id')->limit(10)->get();
                foreach ($items as $a) {
                    $lastId = $a->id;
                    echo "id: {$a->id}\nevent: announcement\ndata: ".json_encode((new AnnouncementResource($a))->resolve())."\n\n";
                }
                echo ": ping\n\n";
                @ob_flush();
                flush();
                if (time() + 5 >= $deadline) {
                    break;
                }
                sleep(5);
            } while (! connection_aborted());
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
