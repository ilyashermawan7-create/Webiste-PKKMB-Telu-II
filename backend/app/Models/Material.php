<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Material extends Model
{
    protected $fillable = ['session_id', 'title', 'description', 'type', 'file_path', 'url', 'order'];

    public function session(): BelongsTo { return $this->belongsTo(PkkmbSession::class, 'session_id'); }
    public function quiz(): HasOne { return $this->hasOne(Quiz::class); }
}
