<?php

namespace App\Services;

use App\Models\Faculty;
use App\Models\StudyProgram;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Import data maba/mentor dari CSV (Excel → "Save As CSV UTF-8").
 * Header wajib: nim,name,email,gender,faculty_code,study_program_code,role,phone,batch
 * Password awal = tanggal lahir/NIM sesuai kebijakan; di sini default NIM (wajib diganti).
 */
class UserImporter
{
    /** @return array{created: int, updated: int, errors: array<int, string>} */
    public function import(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        $header = fgetcsv($handle);
        if (! $header) {
            return ['created' => 0, 'updated' => 0, 'errors' => ['File kosong.']];
        }
        // Hapus BOM Excel & normalisasi header
        $header = array_map(fn ($h) => Str::lower(trim(preg_replace('/^\xEF\xBB\xBF/', '', $h))), $header);

        $faculties = Faculty::pluck('id', 'code');
        $programs = StudyProgram::pluck('id', 'code');
        $created = $updated = 0;
        $errors = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;
            if (count(array_filter($row)) === 0) continue;
            $data = array_combine($header, array_pad($row, count($header), null));

            $v = Validator::make($data, [
                'name' => 'required|string|max:120',
                'email' => 'required|email|max:120',
                'nim' => 'nullable|alpha_num|max:20',
                'gender' => 'nullable|in:L,P',
                'role' => 'nullable|in:MABA,MENTOR,PANITIA',
                'faculty_code' => 'nullable|string',
                'batch' => 'nullable|integer|min:1|max:20',
            ]);
            if ($v->fails()) {
                $errors[$line] = implode(' ', $v->errors()->all());
                continue;
            }

            $role = $data['role'] ?: 'MABA';
            $attrs = [
                'name' => $data['name'],
                'email' => Str::lower($data['email']),
                'role' => $role,
                'gender' => $data['gender'] ?: null,
                'phone' => $data['phone'] ?? null,
                'faculty_id' => $faculties[$data['faculty_code'] ?? ''] ?? null,
                'study_program_id' => $programs[$data['study_program_code'] ?? ''] ?? null,
                'batch' => $data['batch'] ?: null,
            ];

            $key = $data['nim'] ? ['nim' => $data['nim']] : ['email' => $attrs['email']];
            $user = User::where($key)->first();
            if ($user) {
                $user->update($attrs);
                $updated++;
            } else {
                User::create($attrs + $key + ['password' => Hash::make($data['nim'] ?: Str::random(16))]);
                $created++;
            }
        }
        fclose($handle);

        return compact('created', 'updated', 'errors');
    }
}
