<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Gamifikasi, pengumuman, tiket, sertifikat, audit log, konten publik & pengaturan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('name');
            $table->string('description');
            $table->string('icon', 40)->default('award'); // nama ikon Lucide
            $table->unsignedSmallInteger('points')->default(0);
            $table->timestamps();
        });

        Schema::create('badge_user', function (Blueprint $table) {
            $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('awarded_at')->useCurrent();
            $table->primary(['badge_id', 'user_id']);
        });

        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description');
            $table->date('date');
            $table->string('action', 30); // ATTEND/SUBMIT/QUIZ/READ_FAQ/VISIT_MAP
            $table->unsignedSmallInteger('points')->default(5);
            $table->timestamps();
        });

        Schema::create('mission_user', function (Blueprint $table) {
            $table->foreignId('mission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('completed_at')->useCurrent();
            $table->primary(['mission_id', 'user_id']);
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('category', 40)->default('Umum');
            $table->string('audience', 10)->default('ALL'); // ALL/MABA/MENTOR/GROUP/FACULTY
            $table->foreignId('group_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('faculty_id')->nullable()->constrained()->cascadeOnDelete();
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('published_at')->nullable()->index();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category', 12);                     // BANTUAN/PENGADUAN/KEKERASAN
            $table->string('subject');
            $table->text('body');
            $table->string('priority', 8)->default('MEDIUM');   // LOW/MEDIUM/HIGH/URGENT
            $table->string('status', 12)->default('OPEN');      // OPEN/IN_PROGRESS/RESOLVED/CLOSED
            $table->boolean('is_anonymous')->default(false);
            $table->string('reporter_token_hash')->nullable();  // untuk cek status laporan anonim
            $table->string('contact')->nullable();              // opsional, diisi pelapor sendiri
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'priority']);
        });

        Schema::create('ticket_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            $table->boolean('is_staff')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('number', 40)->unique();
            $table->string('verify_hash', 64)->unique();
            $table->timestamp('issued_at');
            $table->string('file_path')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 60);
            $table->string('subject_type', 60)->nullable();
            $table->string('subject_id', 40)->nullable();
            $table->json('changes')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
            $table->index(['subject_type', 'subject_id']);
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->string('category', 40)->default('Umum');
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image_path');
            $table->string('caption')->nullable();
            $table->date('taken_at')->nullable();
            $table->timestamps();
        });

        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category', 40);
            $table->text('description');
            $table->string('instagram', 60)->nullable();
            $table->string('logo_path')->nullable();
            $table->timestamps();
        });

        Schema::create('campus_places', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category', 40);
            $table->text('description');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('image_path')->nullable();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('key', 60)->primary();
            $table->json('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['settings', 'campus_places', 'organizations', 'gallery_items', 'faqs', 'audit_logs', 'certificates',
            'ticket_replies', 'tickets', 'announcements', 'mission_user', 'missions', 'badge_user', 'badges'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
