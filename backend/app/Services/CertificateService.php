<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\PkkmbSession;
use App\Models\Setting;
use App\Models\User;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Kelayakan & penerbitan sertifikat PKKMB digital (PDF + QR verifikasi).
 */
class CertificateService
{
    /** @return array{eligible: bool, attendance_rate: float, required_attendance: float, assignments_done: int, assignments_required: int, min_score: int} */
    public function eligibility(User $user): array
    {
        $rules = Setting::get('certificate_rules', ['min_attendance' => 0.8, 'min_score' => 60]);

        $mandatory = PkkmbSession::forUser($user)->where('is_mandatory', true)->where('ends_at', '<=', now())->pluck('id');
        $attended = $mandatory->isEmpty() ? 0 : Attendance::where('user_id', $user->id)->whereIn('session_id', $mandatory)->count();
        $rate = $mandatory->isEmpty() ? 0.0 : round($attended / $mandatory->count(), 3);

        $required = Assignment::where('is_required', true)->pluck('id');
        $done = DB::table('submissions')->where('user_id', $user->id)->whereIn('assignment_id', $required)
            ->where('status', 'GRADED')->where('score', '>=', $rules['min_score'])->count();

        return [
            'eligible' => $mandatory->isNotEmpty() && $rate >= $rules['min_attendance'] && $done >= $required->count(),
            'attendance_rate' => $rate,
            'required_attendance' => (float) $rules['min_attendance'],
            'assignments_done' => $done,
            'assignments_required' => $required->count(),
            'min_score' => (int) $rules['min_score'],
        ];
    }

    public function issue(User $user): Certificate
    {
        return Certificate::firstOrCreate(['user_id' => $user->id], [
            'number' => sprintf('PKKMB/%s/%s/%06d', now()->year, $user->faculty?->code ?? 'TU', $user->id),
            'verify_hash' => hash('sha256', $user->id.'|'.Str::random(40)),
            'issued_at' => now(),
        ]);
    }

    public function verifyUrl(Certificate $certificate): string
    {
        return rtrim(config('app.frontend_url'), '/').'/verifikasi/'.$certificate->verify_hash;
    }

    /** QR sebagai PNG (DomPDF tidak merender QR SVG dengan andal). */
    public function qrPng(string $data, int $size = 440): string
    {
        return (new Writer(new GDLibRenderer($size, 1)))->writeString($data);
    }

    /** Logo PKKMB (PNG transparan) sebagai data URI untuk DomPDF. */
    public static function logoDataUri(): ?string
    {
        $path = resource_path('images/logo-pkkmb.png');

        return is_file($path) ? 'data:image/png;base64,'.base64_encode((string) file_get_contents($path)) : null;
    }

    /** Render PDF sertifikat (A4 landscape). */
    public function pdf(Certificate $certificate): string
    {
        $certificate->loadMissing('user.faculty', 'user.studyProgram');
        $qr = base64_encode($this->qrPng($this->verifyUrl($certificate)));

        return Pdf::loadView('pdf.certificate', [
            'certificate' => $certificate,
            'user' => $certificate->user,
            'qr' => $qr,
            'theme' => Setting::get('theme_title', 'PKKMB Telkom University'),
            'year' => Setting::get('year', now()->year),
            'verifyUrl' => $this->verifyUrl($certificate),
            'logo' => self::logoDataUri(),
        ])->setPaper('a4', 'landscape')->output();
    }
}
