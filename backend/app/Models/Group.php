<?php

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Gugus / kelompok PKKMB. */
class Group extends Model
{
    protected $fillable = ['code', 'name', 'faculty_id', 'mentor_id', 'batch'];

    public function faculty(): BelongsTo { return $this->belongsTo(Faculty::class); }
    public function mentor(): BelongsTo { return $this->belongsTo(User::class, 'mentor_id'); }

    public function members(): HasMany
    {
        return $this->hasMany(User::class)->where('role', Role::MABA->value);
    }
}
