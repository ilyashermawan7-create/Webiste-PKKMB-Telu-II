<?php

namespace App\Services\Auth;

use App\Models\User;

/**
 * SSO tiruan untuk pengembangan: `code` = NIM atau email user yang sudah ada.
 * JANGAN dipakai di produksi (dinonaktifkan bila APP_ENV=production).
 */
class MockSsoProvider implements SsoProvider
{
    public function redirectUrl(string $state): string
    {
        return rtrim(config('app.frontend_url'), '/').'/login?sso=mock&state='.$state;
    }

    public function resolve(string $code): ?array
    {
        if (app()->isProduction()) {
            return null;
        }
        $user = User::where('nim', $code)->orWhere('email', $code)->first();

        return $user ? ['nim' => $user->nim, 'email' => $user->email, 'name' => $user->name] : null;
    }
}
