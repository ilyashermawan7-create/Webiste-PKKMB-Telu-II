<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function view(User $user, Ticket $ticket): bool
    {
        // Laporan kekerasan hanya untuk PANITIA/ADMIN (Satgas), bukan mentor
        if ($user->hasRole(Role::ADMIN, Role::PANITIA)) {
            return true;
        }

        return $ticket->user_id === $user->id;
    }
}
