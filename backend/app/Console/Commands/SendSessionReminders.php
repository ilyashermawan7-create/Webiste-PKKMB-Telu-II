<?php

namespace App\Console\Commands;

use App\Models\PkkmbSession;
use App\Models\User;
use App\Notifications\SessionReminder;
use Illuminate\Console\Command;

class SendSessionReminders extends Command
{
    protected $signature = 'pkkmb:remind {--dry-run : Hitung penerima tanpa mengirim}';

    protected $description = 'Kirim email pengingat untuk sesi PKKMB yang berlangsung besok';

    public function handle(): int
    {
        $sessions = PkkmbSession::whereDate('starts_at', today()->addDay())->get();
        $total = 0;
        foreach ($sessions as $session) {
            User::where('role', 'MABA')->where('is_active', true)
                ->when($session->batch, fn ($q) => $q->where('batch', $session->batch))
                ->when($session->faculty_id, fn ($q) => $q->where('faculty_id', $session->faculty_id))
                ->chunkById(500, function ($users) use ($session, &$total) {
                    $total += $users->count();
                    if (! $this->option('dry-run')) {
                        foreach ($users as $u) {
                            $u->notify(new SessionReminder($session));
                        }
                    }
                });
        }
        $this->info("{$sessions->count()} sesi besok, {$total} pengingat ".($this->option('dry-run') ? '(dry-run)' : 'dijadwalkan').'.');

        return self::SUCCESS;
    }
}
