<?php

namespace App\Notifications;

use App\Models\PkkmbSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Email pengingat sesi H-1 (dikirim lewat queue agar tidak memblokir). */
class SessionReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public PkkmbSession $session) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $s = $this->session;

        return (new MailMessage)
            ->subject("Pengingat PKKMB: {$s->title}")
            ->greeting("Halo, {$notifiable->name}!")
            ->line("Besok ada sesi **{$s->title}**.")
            ->line('Waktu: '.$s->starts_at->translatedFormat('l, d F Y H:i').' WIB')
            ->line('Lokasi: '.($s->location ?? 'Daring'))
            ->line('Datang 15 menit lebih awal, kenakan atribut lengkap, dan pastikan baterai HP cukup untuk presensi QR.')
            ->action('Lihat jadwal', rtrim(config('app.frontend_url'), '/').'/dashboard/jadwal')
            ->salutation('Salam, Panitia PKKMB Telkom University');
    }
}
