<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = ['code', 'user_id', 'category', 'subject', 'body', 'priority', 'status', 'is_anonymous', 'reporter_token_hash', 'contact', 'assigned_to'];

    protected $hidden = ['reporter_token_hash'];

    protected function casts(): array
    {
        return ['is_anonymous' => 'boolean'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function assignee(): BelongsTo { return $this->belongsTo(User::class, 'assigned_to'); }
    public function replies(): HasMany { return $this->hasMany(TicketReply::class)->orderBy('created_at'); }
}
