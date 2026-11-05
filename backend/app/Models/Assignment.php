<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Assignment extends Model
{
    protected $fillable = ['session_id', 'title', 'description', 'type', 'due_at', 'max_score', 'points', 'is_required'];

    protected function casts(): array
    {
        return ['due_at' => 'datetime', 'is_required' => 'boolean'];
    }

    public function session(): BelongsTo { return $this->belongsTo(PkkmbSession::class, 'session_id'); }
    public function submissions(): HasMany { return $this->hasMany(Submission::class); }

    /** Pengumpulan milik user yang sedang login. */
    public function mySubmission(): HasOne
    {
        return $this->hasOne(Submission::class)->where('user_id', auth()->id());
    }
}
