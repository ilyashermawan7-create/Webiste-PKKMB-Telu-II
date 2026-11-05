<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'due_at' => $this->due_at->toIso8601String(),
            'max_score' => $this->max_score,
            'points' => $this->points,
            'is_required' => $this->is_required,
            'session_id' => $this->session_id,
            'submission' => $this->whenLoaded('mySubmission', fn () => $this->mySubmission ? new SubmissionResource($this->mySubmission) : null),
            'submissions_count' => $this->whenCounted('submissions'),
        ];
    }
}
