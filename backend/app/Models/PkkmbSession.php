<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Sesi PKKMB (tabel `sessions_pkkmb`). */
class PkkmbSession extends Model
{
    protected $table = 'sessions_pkkmb';

    protected $fillable = [
        'title', 'description', 'type', 'mode', 'batch', 'faculty_id', 'day_number', 'starts_at', 'ends_at',
        'location', 'latitude', 'longitude', 'radius_m', 'online_code', 'attendance_open', 'is_mandatory', 'points',
    ];

    protected $hidden = ['online_code'];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'attendance_open' => 'boolean',
            'is_mandatory' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function faculty(): BelongsTo { return $this->belongsTo(Faculty::class); }
    public function attendances(): HasMany { return $this->hasMany(Attendance::class, 'session_id'); }
    public function materials(): HasMany { return $this->hasMany(Material::class, 'session_id'); }

    /** Sesi yang relevan untuk seorang maba: sesuai batch & fakultasnya (atau umum). */
    public function scopeForUser(Builder $q, User $user): Builder
    {
        return $q->where(fn ($w) => $w->whereNull('batch')->orWhere('batch', $user->batch))
            ->where(fn ($w) => $w->whereNull('faculty_id')->orWhere('faculty_id', $user->faculty_id));
    }
}
