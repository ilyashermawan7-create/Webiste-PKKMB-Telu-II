<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Pemakaian: ->middleware('role:ADMIN,PANITIA') */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (! $user || ! $user->is_active) {
            abort(401, 'Sesi berakhir. Silakan login kembali.');
        }
        $allowed = array_map(fn ($r) => Role::from($r), $roles);
        if (! $user->hasRole(...$allowed)) {
            abort(403, 'Kamu tidak memiliki akses ke fitur ini.');
        }

        return $next($request);
    }
}
