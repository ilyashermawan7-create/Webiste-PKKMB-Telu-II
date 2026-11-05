<?php

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nim', 'name', 'email', 'password', 'role', 'gender', 'phone', 'faculty_id',
        'study_program_id', 'group_id', 'batch', 'avatar_path', 'accessibility_needs', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed', // bcrypt via Hash facade
            'role' => Role::class,
            'is_active' => 'boolean',
            'points' => 'integer',
        ];
    }

    public function hasRole(Role ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function faculty(): BelongsTo { return $this->belongsTo(Faculty::class); }
    public function studyProgram(): BelongsTo { return $this->belongsTo(StudyProgram::class); }
    public function group(): BelongsTo { return $this->belongsTo(Group::class); }
    /** Gugus yang dibimbing (khusus MENTOR). */
    public function mentoredGroups(): HasMany { return $this->hasMany(Group::class, 'mentor_id'); }
    public function attendances(): HasMany { return $this->hasMany(Attendance::class); }
    public function submissions(): HasMany { return $this->hasMany(Submission::class); }
    public function badges(): BelongsToMany { return $this->belongsToMany(Badge::class)->withPivot('awarded_at'); }
    public function missions(): BelongsToMany { return $this->belongsToMany(Mission::class)->withPivot('completed_at'); }
    public function certificate(): HasOne { return $this->hasOne(Certificate::class); }
    public function tickets(): HasMany { return $this->hasMany(Ticket::class); }
}
