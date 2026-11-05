<?php

use App\Http\Controllers\Api\Admin\AnalyticsController;
use App\Http\Controllers\Api\Admin\ContentController;
use App\Http\Controllers\Api\Admin\SessionQrController;
use App\Http\Controllers\Api\Admin\SystemController;
use App\Http\Controllers\Api\Admin\TicketAdminController;
use App\Http\Controllers\Api\Admin\UserAdminController;
use App\Http\Controllers\Api\AnnouncementStreamController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AssistantController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\Mentor\MentorController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

/*
| API PKKMB Telkom University — prefix /api/v1
*/

Route::prefix('v1')->group(function () {
    // ---------- Auth ----------
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('auth/sso/callback', [AuthController::class, 'ssoCallback'])->middleware('throttle:login');

    // ---------- Publik ----------
    Route::prefix('public')->middleware('throttle:public')->group(function () {
        Route::get('settings', [PublicController::class, 'settings']);
        Route::get('stats', [PublicController::class, 'stats']);
        Route::get('sessions', [PublicController::class, 'sessions']);
        Route::get('faculties', [PublicController::class, 'faculties']);
        Route::get('organizations', [PublicController::class, 'organizations']);
        Route::get('faqs', [PublicController::class, 'faqs']);
        Route::get('announcements', [PublicController::class, 'announcements']);
        Route::get('announcements/{announcement}', [PublicController::class, 'announcement']);
        Route::get('gallery', [PublicController::class, 'gallery']);
        Route::get('places', [PublicController::class, 'places']);
        Route::get('certificates/{hash}', [PublicController::class, 'verifyCertificate']);
        Route::post('reports', [PublicController::class, 'storeReport'])->middleware('throttle:reports');
        Route::get('reports/{code}', [PublicController::class, 'reportStatus'])->middleware('throttle:reports');
    });

    // File privat via signed URL
    Route::get('files/submissions/{submission}', [FileController::class, 'submission'])
        ->name('files.submission')->middleware('signed');

    // ---------- Terautentikasi ----------
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/password', [AuthController::class, 'changePassword']);
        Route::patch('auth/profile', [AuthController::class, 'updateProfile']);

        Route::get('announcements', [MeController::class, 'announcements']);
        Route::get('announcements/stream', [AnnouncementStreamController::class, 'stream']);
        Route::post('assistant/ask', [AssistantController::class, 'ask'])->middleware('throttle:assistant');

        Route::get('tickets', [TicketController::class, 'index']);
        Route::post('tickets', [TicketController::class, 'store'])->middleware('throttle:reports');
        Route::get('tickets/{ticket}', [TicketController::class, 'show']);
        Route::post('tickets/{ticket}/replies', [TicketController::class, 'reply']);

        // ---------- MABA ----------
        Route::middleware('role:MABA')->group(function () {
            Route::get('me/dashboard', [MeController::class, 'dashboard']);
            Route::get('me/schedule', [MeController::class, 'schedule']);
            Route::get('me/gamification', [MeController::class, 'gamification']);
            Route::get('me/card', [MeController::class, 'card']);
            Route::post('me/missions/visit', [MeController::class, 'completeVisitMission']);

            Route::post('attendance/qr', [AttendanceController::class, 'qr'])->middleware('throttle:attendance');
            Route::post('attendance/code', [AttendanceController::class, 'code'])->middleware('throttle:attendance');

            Route::get('assignments', [AssignmentController::class, 'index']);
            Route::get('assignments/{assignment}', [AssignmentController::class, 'show']);
            Route::post('assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->middleware('throttle:uploads');

            Route::get('materials', [MaterialController::class, 'index']);
            Route::get('materials/{material}', [MaterialController::class, 'show']);
            Route::get('quizzes/{quiz}', [MaterialController::class, 'quiz']);
            Route::post('quizzes/{quiz}/attempt', [MaterialController::class, 'attempt']);

            Route::get('certificate', [CertificateController::class, 'show']);
            Route::get('certificate/download', [CertificateController::class, 'download']);
        });

        // ---------- MENTOR / PANITIA / ADMIN ----------
        Route::prefix('mentor')->middleware(['role:MENTOR,PANITIA,ADMIN', 'audit'])->group(function () {
            Route::get('groups', [MentorController::class, 'groups']);
            Route::get('groups/{group}', [MentorController::class, 'group']);
            Route::get('submissions', [MentorController::class, 'submissions']);
            Route::post('submissions/{submission}/grade', [MentorController::class, 'grade']);
            Route::get('sessions/active', [MentorController::class, 'activeSessions']);
            Route::post('scan', [MentorController::class, 'scan'])->middleware('throttle:scan');
            Route::post('announcements', [MentorController::class, 'announce']);
        });

        // ---------- ADMIN (PANITIA: operasional terbatas) ----------
        Route::prefix('admin')->middleware(['role:ADMIN,PANITIA', 'audit'])->group(function () {
            Route::get('analytics', [AnalyticsController::class, 'index']);
            Route::get('sessions/{session}/qr', [SessionQrController::class, 'show']);
            Route::post('sessions/{session}/attendance', [SessionQrController::class, 'toggle']);
            Route::get('tickets', [TicketAdminController::class, 'index']);
            Route::get('tickets/{ticket}', [TicketAdminController::class, 'show']);
            Route::patch('tickets/{ticket}', [TicketAdminController::class, 'update']);
            Route::get('content/{resource}', [ContentController::class, 'index']);
            Route::post('content/announcements', [ContentController::class, 'store'])->defaults('resource', 'announcements');

            Route::middleware('role:ADMIN')->group(function () {
                Route::post('content/{resource}', [ContentController::class, 'store']);
                Route::post('content/{resource}/{id}', [ContentController::class, 'update']); // POST agar multipart (file) didukung
                Route::delete('content/{resource}/{id}', [ContentController::class, 'destroy']);
                Route::get('users', [UserAdminController::class, 'index']);
                Route::patch('users/{user}', [UserAdminController::class, 'update']);
                Route::post('import/users', [UserAdminController::class, 'import']);
                Route::get('groups', [UserAdminController::class, 'groups']);
                Route::patch('groups/{group}', [UserAdminController::class, 'updateGroup']);
                Route::post('groups/auto-assign', [UserAdminController::class, 'autoAssign']);
                Route::get('export/attendance', [AnalyticsController::class, 'exportAttendance']);
                Route::get('export/report', [AnalyticsController::class, 'exportPdf']);
                Route::get('audit-logs', [SystemController::class, 'auditLogs']);
                Route::get('settings', [SystemController::class, 'settings']);
                Route::patch('settings', [SystemController::class, 'updateSettings']);
            });
        });
    });
});
