<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
            'audit' => \App\Http\Middleware\AuditTrail::class,
        ]);
        $middleware->api(append: [\App\Http\Middleware\SecurityHeaders::class]);
        // Di belakang reverse proxy (Nginx/Next.js BFF) agar IP klien benar untuk rate limit
        $middleware->trustProxies(at: env('TRUSTED_PROXIES', '127.0.0.1,172.16.0.0/12,10.0.0.0/8'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API selalu JSON, tanpa redirect ke halaman login
        $exceptions->shouldRenderJsonWhen(fn (Request $r) => $r->is('api/*') || $r->expectsJson());
        $exceptions->render(fn (AuthenticationException $e, Request $r) => response()->json(['message' => 'Sesi berakhir. Silakan login kembali.'], 401));
    })->create();
