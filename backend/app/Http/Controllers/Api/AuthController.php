<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\SsoProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Login dengan NIM (maba) atau email (staf) + password → Sanctum token. */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'login' => 'required|string|max:120',
            'password' => 'required|string|max:128',
            'device' => 'nullable|string|max:40',
        ]);

        $login = trim($data['login']);
        $user = User::query()
            ->where(str_contains($login, '@') ? 'email' : 'nim', str_contains($login, '@') ? Str::lower($login) : $login)
            ->first();

        // Pesan generik agar tidak membocorkan NIM yang terdaftar
        if (! $user || ! Hash::check($data['password'], $user->password) || ! $user->is_active) {
            throw ValidationException::withMessages(['login' => 'NIM/email atau kata sandi salah.']);
        }

        return $this->issueToken($user, $data['device'] ?? 'web');
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('faculty', 'studyProgram', 'group.mentor', 'group.faculty'));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['ok' => true]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed|different:current_password',
        ]);
        $request->user()->update(['password' => $data['password']]);

        return response()->json(['ok' => true]);
    }

    public function updateProfile(Request $request): UserResource
    {
        $data = $request->validate([
            'phone' => 'nullable|string|max:20|regex:/^[0-9+ ]+$/',
            'accessibility_needs' => 'nullable|string|max:1000',
        ]);
        $request->user()->update($data);

        return $this->me($request);
    }

    /** Adapter SSO kampus (default: mock). */
    public function ssoCallback(Request $request, SsoProvider $sso): JsonResponse
    {
        $data = $request->validate(['code' => 'required|string|max:200']);
        $profile = $sso->resolve($data['code']);
        if (! $profile) {
            throw ValidationException::withMessages(['code' => 'Login SSO gagal.']);
        }
        $user = User::where('email', $profile['email'])->when($profile['nim'], fn ($q) => $q->orWhere('nim', $profile['nim']))->first();
        if (! $user || ! $user->is_active) {
            throw ValidationException::withMessages(['code' => 'Akun belum terdaftar sebagai peserta PKKMB.']);
        }

        return $this->issueToken($user, 'sso');
    }

    private function issueToken(User $user, string $device): JsonResponse
    {
        $user->forceFill(['last_login_at' => now()])->save();
        // Token berlaku 14 hari; abilities = role untuk pemeriksaan cepat
        $token = $user->createToken($device, [$user->role->value], now()->addDays(14))->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user->load('faculty', 'studyProgram', 'group')),
        ]);
    }
}
