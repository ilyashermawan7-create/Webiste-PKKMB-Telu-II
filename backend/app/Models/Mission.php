<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Misi harian gamifikasi. */
class Mission extends Model
{
    protected $fillable = ['title', 'description', 'date', 'action', 'points'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }
}
