<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    protected $fillable = ['quiz_id', 'question', 'options', 'answer_index'];

    // Kunci jawaban tidak pernah dikirim ke klien
    protected $hidden = ['answer_index'];

    protected function casts(): array
    {
        return ['options' => 'array'];
    }
}
