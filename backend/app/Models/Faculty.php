<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    protected $fillable = ['code', 'name', 'name_en', 'description', 'logo_path'];

    public function studyPrograms(): HasMany { return $this->hasMany(StudyProgram::class); }
    public function groups(): HasMany { return $this->hasMany(Group::class); }
    public function users(): HasMany { return $this->hasMany(User::class); }
}
