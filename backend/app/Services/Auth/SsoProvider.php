<?php

namespace App\Services\Auth;

/**
 * Kontrak adapter SSO kampus (mis. CAS/OAuth iGracias).
 * Implementasi nyata cukup mengembalikan profil terverifikasi; pencocokan user di AuthController.
 */
interface SsoProvider
{
    /** URL redirect ke halaman login SSO. */
    public function redirectUrl(string $state): string;

    /**
     * Tukar kode callback menjadi profil.
     *
     * @return array{nim: ?string, email: string, name: string}|null
     */
    public function resolve(string $code): ?array;
}
