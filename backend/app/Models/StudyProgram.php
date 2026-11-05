<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyProgram extends Model
{
    protected $fillable = ['faculty_id', 'code', 'name', 'degree', 'accreditation'];

    public function faculty(): BelongsTo { return $this->belongsTo(Faculty::class); }
}
