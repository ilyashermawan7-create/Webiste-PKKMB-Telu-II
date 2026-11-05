<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['session_id', 'user_id', 'method', 'status', 'latitude', 'longitude', 'scanned_by'];

    public function session(): BelongsTo { return $this->belongsTo(PkkmbSession::class, 'session_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
