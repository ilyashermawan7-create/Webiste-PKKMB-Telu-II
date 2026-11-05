<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Profil user. Data pribadi hanya keluar untuk pemiliknya atau staf (UU PDP). */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $private = $viewer && ($viewer->id === $this->id || $viewer->role->isStaff());

        return [
            'id' => $this->id,
            'nim' => $this->nim,
            'name' => $this->name,
            'email' => $this->when($private, $this->email),
            'phone' => $this->when($private, $this->phone),
            'role' => $this->role,
            'gender' => $this->gender,
            'batch' => $this->batch,
            'points' => $this->points,
            'accessibility_needs' => $this->when($private, $this->accessibility_needs),
            'faculty' => $this->whenLoaded('faculty', fn () => $this->faculty?->only('id', 'code', 'name')),
            'study_program' => $this->whenLoaded('studyProgram', fn () => $this->studyProgram?->only('id', 'name', 'degree')),
            'group' => $this->whenLoaded('group', fn () => $this->group ? new GroupResource($this->group) : null),
            'last_login_at' => $this->when($private, $this->last_login_at?->toIso8601String()),
        ];
    }
}
