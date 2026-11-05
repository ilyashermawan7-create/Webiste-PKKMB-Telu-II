<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    /** Catat aksi admin/panitia secara eksplisit (melengkapi middleware audit). */
    public static function log(string $action, ?Model $subject = null, array $changes = []): void
    {
        $req = request();
        AuditLog::create([
            'user_id' => $req->user()?->id,
            'action' => $action,
            'subject_type' => $subject ? class_basename($subject) : null,
            'subject_id' => $subject?->getKey(),
            'changes' => $changes ?: null,
            'ip' => $req->ip(),
            'user_agent' => substr((string) $req->userAgent(), 0, 255),
        ]);
    }
}
