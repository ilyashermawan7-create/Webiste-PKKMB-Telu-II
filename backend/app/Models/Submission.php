<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    public $timestamps = false;

    protected $fillable = ['assignment_id', 'user_id', 'file_path', 'url', 'text', 'status', 'score', 'feedback', 'graded_by', 'submitted_at', 'graded_at'];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime', 'graded_at' => 'datetime'];
    }

    public function assignment(): BelongsTo { return $this->belongsTo(Assignment::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function grader(): BelongsTo { return $this->belongsTo(User::class, 'graded_by'); }
}
