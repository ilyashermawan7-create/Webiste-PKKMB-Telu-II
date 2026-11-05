<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssignmentResource;
use App\Models\Assignment;
use App\Models\Submission;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AssignmentController extends Controller
{
    public function index()
    {
        return AssignmentResource::collection(Assignment::with('mySubmission')->orderBy('due_at')->get());
    }

    public function show(Assignment $assignment): AssignmentResource
    {
        return new AssignmentResource($assignment->load('mySubmission'));
    }

    /**
     * Upload tugas. Validasi: tipe MIME nyata (bukan ekstensi), ukuran ≤ 10 MB,
     * disimpan dengan nama acak di disk privat.
     */
    public function submit(Request $request, Assignment $assignment, GamificationService $game): AssignmentResource
    {
        $rules = match ($assignment->type) {
            'FILE' => ['file' => 'required|file|max:10240|mimetypes:application/pdf,image/jpeg,image/png,image/webp'],
            'LINK' => ['url' => ['required', 'url:https', 'max:500']],
            default => ['text' => 'required|string|min:20|max:10000'],
        };
        $data = $request->validate($rules);

        $user = $request->user();
        $existing = Submission::where('assignment_id', $assignment->id)->where('user_id', $user->id)->first();
        if ($existing?->status === 'GRADED') {
            throw ValidationException::withMessages(['file' => 'Tugas sudah dinilai dan tidak bisa diubah.']);
        }
        if (now()->gt($assignment->due_at->copy()->addHours(24)) && $existing?->status !== 'REVISION') {
            throw ValidationException::withMessages(['file' => 'Batas pengumpulan sudah lewat.']);
        }

        $path = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store("submissions/{$assignment->id}", config('filesystems.private_uploads'));
        }

        Submission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'user_id' => $user->id],
            [
                'file_path' => $path ?? $existing?->file_path,
                'url' => $data['url'] ?? null,
                'text' => isset($data['text']) ? strip_tags($data['text']) : null,
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
            ],
        );

        if (! $existing) {
            $game->completeMission($user, 'SUBMIT');
            if (now()->lte($assignment->due_at->copy()->subDay())) {
                $game->award($user, 'GERCEP');
            }
        }

        return new AssignmentResource($assignment->load('mySubmission'));
    }
}
