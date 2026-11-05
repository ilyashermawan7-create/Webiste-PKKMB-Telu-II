<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $staff = $request->user()?->role->isStaff();

        return [
            'id' => $this->id,
            'code' => $this->code,
            'category' => $this->category,
            'subject' => $this->subject,
            'body' => $this->body,
            'priority' => $this->priority,
            'status' => $this->status,
            'is_anonymous' => $this->is_anonymous,
            // Identitas pelapor tidak pernah ditampilkan untuk laporan anonim
            'reporter' => $this->when($staff && ! $this->is_anonymous, fn () => $this->user?->only('id', 'name', 'nim')),
            'contact' => $this->when((bool) $staff, $this->contact),
            'assignee' => $this->when((bool) $staff, fn () => $this->assignee?->only('id', 'name')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'replies' => $this->whenLoaded('replies', fn () => $this->replies->map(fn ($r) => [
                'id' => $r->id, 'body' => $r->body, 'is_staff' => $r->is_staff, 'created_at' => $r->created_at->toIso8601String(),
            ])),
        ];
    }
}
