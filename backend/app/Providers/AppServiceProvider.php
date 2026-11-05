<?php

namespace App\Providers;

use App\Models\Submission;
use App\Models\Ticket;
use App\Policies\SubmissionPolicy;
use App\Policies\TicketPolicy;
use App\Services\Auth\MockSsoProvider;
use App\Services\Auth\SsoProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Ganti MockSsoProvider dengan adapter SSO kampus sungguhan di produksi
        $this->app->bind(SsoProvider::class, match (config('services.sso.driver')) {
            default => MockSsoProvider::class,
        });
    }

    public function boot(): void
    {
        Gate::policy(Ticket::class, TicketPolicy::class);
        Gate::policy(Submission::class, SubmissionPolicy::class);

        // Rate limit (disimpan di Redis via CACHE_STORE=redis)
        $byUser = fn (Request $r) => $r->user()?->id ?: $r->ip();
        RateLimiter::for('login', fn (Request $r) => [
            Limit::perMinute(5)->by('login:'.strtolower((string) $r->input('login')).'|'.$r->ip()),
            Limit::perMinute(30)->by('login-ip:'.$r->ip()),
        ]);
        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(120)->by($byUser($r)));
        RateLimiter::for('public', fn (Request $r) => Limit::perMinute(240)->by($r->ip()));
        RateLimiter::for('attendance', fn (Request $r) => Limit::perMinute(10)->by('att:'.$byUser($r)));
        RateLimiter::for('scan', fn (Request $r) => Limit::perMinute(120)->by('scan:'.$byUser($r)));
        RateLimiter::for('uploads', fn (Request $r) => Limit::perMinute(10)->by('up:'.$byUser($r)));
        RateLimiter::for('assistant', fn (Request $r) => Limit::perMinute(10)->by('ai:'.$byUser($r)));
        RateLimiter::for('reports', fn (Request $r) => Limit::perHour(10)->by('rep:'.$r->ip()));
    }
}
