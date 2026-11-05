<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mencatat setiap request yang mengubah data (POST/PUT/PATCH/DELETE) oleh staf ke audit_logs.
 * Field sensitif (password, token, file) tidak disimpan.
 */
class AuditTrail
{
    private const REDACT = ['password', 'password_confirmation', 'token', 'file', 'image', 'current_password'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true) && $response->getStatusCode() < 400) {
            $route = $request->route();
            $params = $route?->parameters() ?? [];
            $subject = collect($params)->first();

            AuditLog::create([
                'user_id' => $request->user()?->id,
                'action' => $request->method().' '.($route?->uri() ?? $request->path()),
                'subject_type' => is_object($subject) ? class_basename($subject) : null,
                'subject_id' => is_object($subject) && method_exists($subject, 'getKey') ? (string) $subject->getKey() : (is_scalar($subject) ? (string) $subject : null),
                'changes' => collect($request->except(self::REDACT))->map(fn ($v) => is_string($v) ? mb_substr($v, 0, 500) : $v)->all() ?: null,
                'ip' => $request->ip(),
                'user_agent' => mb_substr((string) $request->userAgent(), 0, 255),
            ]);
        }

        return $response;
    }
}
