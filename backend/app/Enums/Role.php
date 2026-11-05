<?php

namespace App\Enums;

enum Role: string
{
    case MABA = 'MABA';
    case MENTOR = 'MENTOR';
    case PANITIA = 'PANITIA';
    case ADMIN = 'ADMIN';

    /** Role staf yang boleh mengakses fitur pengelolaan. */
    public function isStaff(): bool
    {
        return in_array($this, [self::MENTOR, self::PANITIA, self::ADMIN], true);
    }
}
