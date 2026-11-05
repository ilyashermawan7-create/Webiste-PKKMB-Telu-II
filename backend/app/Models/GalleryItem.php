<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryItem extends Model
{
    protected $fillable = ['title', 'image_path', 'caption', 'taken_at'];

    protected function casts(): array
    {
        return ['taken_at' => 'date'];
    }
}
