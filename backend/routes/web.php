<?php

use Illuminate\Support\Facades\Route;

// Backend murni API; halaman web disajikan oleh frontend Next.js
Route::get('/', fn () => response()->json(['name' => 'PKKMB Telkom University API', 'docs' => '/api/v1']));
