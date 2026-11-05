<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusPlace extends Model
{
    protected $fillable = ['name', 'category', 'description', 'latitude', 'longitude', 'image_path'];

    protected function casts(): array
    {
        return ['latitude' => 'float', 'longitude' => 'float'];
    }
}
