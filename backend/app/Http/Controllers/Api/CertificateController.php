<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class CertificateController extends Controller
{
    public function __construct(private CertificateService $certs) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $cert = $user->certificate;

        return response()->json(['data' => [
            'eligibility' => $this->certs->eligibility($user),
            'certificate' => $cert ? [
                'number' => $cert->number,
                'issued_at' => $cert->issued_at->toIso8601String(),
                'verify_url' => $this->certs->verifyUrl($cert),
            ] : null,
        ]]);
    }

    /** Terbitkan (bila memenuhi syarat) lalu unduh PDF. */
    public function download(Request $request): Response
    {
        $user = $request->user();
        $cert = $user->certificate;
        if (! $cert) {
            if (! $this->certs->eligibility($user)['eligible']) {
                throw ValidationException::withMessages(['certificate' => 'Syarat kehadiran & tugas belum terpenuhi.']);
            }
            $cert = $this->certs->issue($user);
        }

        return response($this->certs->pdf($cert), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="Sertifikat-PKKMB-'.($user->nim ?? $user->id).'.pdf"',
        ]);
    }
}
