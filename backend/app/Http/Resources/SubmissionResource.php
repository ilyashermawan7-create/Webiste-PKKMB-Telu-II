<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class SubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assignment_id' => $this->assignment_id,
            'status' => $this->status,
            'score' => $this->score,
            'feedback' => $this->feedback,
            // File privat diakses lewat signed URL berumur pendek (cegah IDOR)
            'file_url' => $this->file_path ? URL::temporarySignedRoute('files.submission', now()->addMinutes(30), ['submission' => $this->id]) : null,
            'url' => $this->url,
            'text' => $this->text,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'graded_at' => $this->graded_at?->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => $this->user->only('id', 'name', 'nim')),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment->only('id', 'title', 'max_score')),
        ];
    }
}
