<?php

use Illuminate\Support\Facades\Schedule;

// Pengingat sesi H-1 setiap pukul 18:00 WIB (jalankan `php artisan schedule:work` / cron)
Schedule::command('pkkmb:remind')->dailyAt('18:00')->timezone('Asia/Jakarta')->withoutOverlapping();
