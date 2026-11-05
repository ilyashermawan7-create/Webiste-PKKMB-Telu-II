<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kegiatan: sesi, presensi, materi + kuis, penugasan + pengumpulan.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Nama `sessions_pkkmb` karena tabel `sessions` dipakai session driver Laravel
        Schema::create('sessions_pkkmb', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type', 16)->default('UNIVERSITAS'); // PRE/UNIVERSITAS/FAKULTAS/PRODI
            $table->string('mode', 8)->default('OFFLINE');      // ONLINE/OFFLINE
            $table->unsignedSmallInteger('batch')->nullable();
            $table->foreignId('faculty_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('day_number')->default(1);
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('radius_m')->nullable();   // geofence opsional
            $table->string('online_code', 12)->nullable();     // kode presensi sesi online
            $table->boolean('attendance_open')->default(false);
            $table->boolean('is_mandatory')->default(true);
            $table->unsignedSmallInteger('points')->default(10);
            $table->timestamps();
            $table->index(['starts_at', 'batch']);
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('sessions_pkkmb')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('method', 8);                     // QR/CODE/MANUAL/SCAN
            $table->string('status', 10)->default('HADIR');  // HADIR/TERLAMBAT/IZIN
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('scanned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
            // Kunci idempotensi: satu presensi per user per sesi (aman saat lonjakan)
            $table->unique(['session_id', 'user_id']);
            $table->index('user_id');
        });

        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->nullable()->constrained('sessions_pkkmb')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type', 8); // PDF/VIDEO/LINK
            $table->string('file_path')->nullable();
            $table->string('url')->nullable();
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->unsignedTinyInteger('pass_score')->default(70);
            $table->unsignedSmallInteger('points')->default(10);
            $table->timestamps();
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->json('options');
            $table->unsignedTinyInteger('answer_index');
            $table->timestamps();
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->json('answers');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['quiz_id', 'user_id']);
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->nullable()->constrained('sessions_pkkmb')->nullOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('type', 8)->default('FILE'); // FILE/LINK/TEXT
            $table->timestamp('due_at');
            $table->unsignedSmallInteger('max_score')->default(100);
            $table->unsignedSmallInteger('points')->default(20);
            $table->boolean('is_required')->default(true);
            $table->timestamps();
        });

        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('file_path')->nullable();
            $table->string('url', 500)->nullable();
            $table->text('text')->nullable();
            $table->string('status', 10)->default('SUBMITTED'); // SUBMITTED/GRADED/REVISION
            $table->unsignedSmallInteger('score')->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('graded_at')->nullable();
            $table->unique(['assignment_id', 'user_id']);
        });
    }

    public function down(): void
    {
        foreach (['submissions', 'assignments', 'quiz_attempts', 'quiz_questions', 'quizzes', 'materials', 'attendances', 'sessions_pkkmb'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
