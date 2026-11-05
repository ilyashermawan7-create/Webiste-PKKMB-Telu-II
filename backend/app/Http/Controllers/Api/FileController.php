<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Unduh file tugas melalui signed URL (dibuat hanya untuk pemilik / mentor / staf). */
class FileController extends Controller
{
    public function submission(Submission $submission): StreamedResponse
    {
        abort_unless($submission->file_path, 404);

        return Storage::disk(config('filesystems.private_uploads'))->download($submission->file_path, basename($submission->file_path));
    }
}
