<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Submission;
use App\Models\User;

/** Mentor hanya boleh melihat/menilai tugas anggota gugus bimbingannya (anti-IDOR). */
class SubmissionPolicy
{
    public function grade(User $user, Submission $submission): bool
    {
        if ($user->hasRole(Role::ADMIN, Role::PANITIA)) {
            return true;
        }
        if ($user->role !== Role::MENTOR) {
            return false;
        }

        return $user->mentoredGroups()->whereKey($submission->user->group_id)->exists();
    }
}
