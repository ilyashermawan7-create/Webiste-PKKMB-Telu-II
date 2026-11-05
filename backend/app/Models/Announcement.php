<?php

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    protected $fillable = ['title', 'body', 'category', 'audience', 'group_id', 'faculty_id', 'is_pinned', 'published_at', 'author_id'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime', 'is_pinned' => 'boolean'];
    }

    public function author(): BelongsTo { return $this->belongsTo(User::class, 'author_id'); }
    public function group(): BelongsTo { return $this->belongsTo(Group::class); }

    public function scopePublished(Builder $q): Builder
    {
        return $q->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    /** Pengumuman yang boleh dilihat user tertentu. */
    public function scopeVisibleTo(Builder $q, User $user): Builder
    {
        return $q->published()->where(function ($w) use ($user) {
            $w->where('audience', 'ALL')
                ->orWhere('audience', $user->role === Role::MABA ? 'MABA' : 'MENTOR')
                ->orWhere(fn ($g) => $g->where('audience', 'GROUP')->where('group_id', $user->group_id))
                ->orWhere(fn ($f) => $f->where('audience', 'FACULTY')->where('faculty_id', $user->faculty_id));
            if ($user->role === Role::MENTOR) {
                $w->orWhere(fn ($g) => $g->where('audience', 'GROUP')->whereIn('group_id', $user->mentoredGroups()->select('id')));
            }
        });
    }
}
