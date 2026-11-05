<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['quiz_id', 'user_id', 'score', 'answers'];

    protected function casts(): array
    {
        return ['answers' => 'array'];
    }
}
