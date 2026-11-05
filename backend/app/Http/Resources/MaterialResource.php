<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $quiz = $this->whenLoaded('quiz');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'url' => $this->url,
            'file_url' => $this->file_path ? Storage::disk(config('filesystems.public_uploads'))->url($this->file_path) : null,
            'session_id' => $this->session_id,
            'order' => $this->order,
            'quiz' => $this->when($this->relationLoaded('quiz') && $this->quiz, fn () => [
                'id' => $this->quiz->id,
                'title' => $this->quiz->title,
                'pass_score' => $this->quiz->pass_score,
                'points' => $this->quiz->points,
                'best_score' => $this->best_score ?? null,
            ]),
        ];
    }
}
