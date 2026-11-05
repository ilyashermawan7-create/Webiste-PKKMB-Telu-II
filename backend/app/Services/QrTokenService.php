<?php

namespace App\Services;

/**
 * Token QR presensi dinamis yang berganti setiap 30 detik.
 *
 * Format: base64url("{sessionId}.{window}.{hmac}") dengan
 *   window = floor(unixTime / 30)
 *   hmac   = HMAC-SHA256(APP_KEY + ':qr', "{sessionId}|{window}") dipotong 32 karakter hex.
 *
 * Validasi tidak menyentuh database (penting saat ±8.000 maba presensi serentak).
 * Window sebelumnya masih diterima untuk toleransi jeda jaringan/jam HP (maks ±60 detik).
 */
class QrTokenService
{
    public const WINDOW_SECONDS = 30;

    private function secret(): string
    {
        return config('app.key').':qr';
    }

    public function currentWindow(?int $time = null): int
    {
        return intdiv($time ?? time(), self::WINDOW_SECONDS);
    }

    public function make(int $sessionId, ?int $window = null): string
    {
        $window ??= $this->currentWindow();
        $sig = substr(hash_hmac('sha256', "{$sessionId}|{$window}", $this->secret()), 0, 32);

        return rtrim(strtr(base64_encode("{$sessionId}.{$window}.{$sig}"), '+/', '-_'), '=');
    }

    /** Detik tersisa sebelum token berganti. */
    public function secondsRemaining(): int
    {
        return self::WINDOW_SECONDS - (time() % self::WINDOW_SECONDS);
    }

    /** @return int|null ID sesi bila token valid & belum kedaluwarsa. */
    public function verify(string $token): ?int
    {
        $raw = base64_decode(strtr($token, '-_', '+/'), true);
        if ($raw === false || substr_count($raw, '.') !== 2) {
            return null;
        }
        [$sessionId, $window, $sig] = explode('.', $raw);
        if (! ctype_digit($sessionId) || ! ctype_digit($window)) {
            return null;
        }
        $now = $this->currentWindow();
        if (! in_array((int) $window, [$now, $now - 1], true)) {
            return null;
        }
        $expected = substr(hash_hmac('sha256', "{$sessionId}|{$window}", $this->secret()), 0, 32);

        return hash_equals($expected, $sig) ? (int) $sessionId : null;
    }

    /** Token statis untuk QR kartu identitas maba (dipindai panitia). */
    public function memberCardToken(int $userId): string
    {
        $sig = substr(hash_hmac('sha256', "card|{$userId}", $this->secret()), 0, 24);

        return "TELU-{$userId}-{$sig}";
    }

    public function verifyMemberCard(string $token): ?int
    {
        if (! preg_match('/^TELU-(\d+)-([a-f0-9]{24})$/', $token, $m)) {
            return null;
        }

        return hash_equals($this->memberCardToken((int) $m[1]), $token) ? (int) $m[1] : null;
    }
}
