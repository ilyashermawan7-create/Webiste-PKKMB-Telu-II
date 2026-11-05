<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'batch' => $this->batch,
            'faculty' => $this->whenLoaded('faculty', fn () => $this->faculty?->only('id', 'code', 'name')),
            'mentor' => $this->whenLoaded('mentor', fn () => $this->mentor?->only('id', 'name', 'phone')),
            'members_count' => $this->whenCounted('members'),
        ];
    }
}
