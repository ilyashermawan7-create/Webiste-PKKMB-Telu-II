# Arsitektur Website PKKMB Telkom University

> Dokumen desain (Langkah 1): arsitektur, skema database, sitemap, dan kontrak API.
> Stack: **Backend Laravel 12 (REST API)** + **Frontend Next.js 15 (App Router)**.

## 1. Gambaran Arsitektur

```
                    ┌──────────────────────────────┐
  Maba / Mentor ──► │  Next.js 15 (frontend)       │  SSR/ISR halaman publik,
  Panitia / Admin   │  - App Router + RSC          │  dashboard per role,
  (HP, PWA)         │  - Route Handler /api/auth/* │  PWA (manifest + SW)
                    │  - middleware.ts (guard role)│
                    └──────────────┬───────────────┘
                                   │ HTTPS JSON (Bearer token Sanctum,
                                   │ disimpan di cookie httpOnly oleh Next.js)
                    ┌──────────────▼───────────────┐
                    │  Laravel 12 (backend /api/v1)│
                    │  - Sanctum token + abilities │
                    │  - FormRequest (validasi)    │
                    │  - Policy/Gate per role      │
                    │  - RateLimiter (Redis)       │
                    │  - Queue (Redis) → email,    │
                    │    sertifikat, import CSV    │
                    │  - SSE /announcements/stream │
                    └───┬──────────┬──────────┬────┘
                        │          │          │
                 PostgreSQL     Redis     S3 (MinIO / R2)
                 (data utama) (cache,    (tugas, foto galeri,
                              rate-limit, materi PDF,
                              queue,     sertifikat)
                              QR nonce)
```

### Keputusan desain utama

| Topik | Keputusan | Alasan |
|---|---|---|
| Pemisahan FE/BE | Laravel murni API (`/api/v1`), Next.js murni UI | Tim BE & FE bisa bekerja paralel; API bisa dipakai aplikasi mobile kelak. |
| Auth | Laravel Sanctum *personal access token*; Next.js menyimpan token di cookie `httpOnly; Secure; SameSite=Lax` lewat Route Handler (BFF). Browser tak pernah memegang token di JS. | Aman dari XSS-token-theft; CSRF ditangkal SameSite + token tidak berbasis cookie di sisi Laravel. |
| SSO kampus | `App\Services\Auth\SsoProvider` (interface) + `MockSsoProvider`. | Bisa diganti adapter CAS/OAuth iGracias tanpa ubah controller. |
| Role | Kolom `users.role` (enum `MABA, MENTOR, PANITIA, ADMIN`) + middleware `role:` + Policy. | Sederhana, cepat dicek; Policy menangani IDOR (mis. mentor hanya gugusnya). |
| QR presensi dinamis | Token = `base64url(sessionId.window.HMAC_SHA256(secret, sessionId|window))`, `window = floor(now/30s)`; diterima window sekarang & sebelumnya (toleransi jam). | Tanpa tulis DB tiap 30 detik; validasi O(1); screenshot QR basi > 60 detik. |
| Lonjakan presensi 8.000 user | Validasi HMAC tanpa DB, `UNIQUE(session_id,user_id)` + `insertOrIgnore`, rate limit per user, cache sesi di Redis, PHP-FPM/Octane horizontal. | Endpoint presensi = 1 query insert. |
| Geofence | Haversine terhadap `sessions.latitude/longitude/radius_m` (opsional per sesi). | Bisa dimatikan untuk sesi online. |
| Realtime | Server-Sent Events (`GET /api/v1/announcements/stream`) — Next.js membaca via `EventSource` lewat proxy. | Tanpa layanan pihak ketiga; bisa diganti Pusher/Reverb. |
| Leaderboard | Agregat poin per **gugus** (bukan individu). | Sesuai prinsip PKKMB yang sehat & kolaboratif. |
| Pengaduan anonim | `tickets.user_id` nullable + `reporter_token` acak untuk cek status; IP tidak disimpan. | Melindungi pelapor (UU PDP & Panduan PKKMB). |
| Pengaturan tema | Tabel `settings` (key/value JSON), di-cache, diedit admin. | Ganti judul/tagline/tanggal tanpa deploy. |
| Audit log | Middleware `audit` pada semua rute ADMIN/PANITIA yang mengubah data. | Jejak akuntabilitas. |
| i18n | `next-intl` (id default, en). | |

## 2. Skema Database

Padanan dari model Prisma yang diminta, diimplementasikan sebagai **migrasi Laravel**
(`backend/database/migrations`). Role disimpan sebagai enum kolom (bukan tabel) — tabel `Role`
diganti `App\Enums\Role` agar pengecekan cepat dan tidak perlu join.

```
faculties            (id, code UNIQUE, name, name_en, description, color?, logo_path, timestamps)
study_programs       (id, faculty_id FK, code UNIQUE, name, degree[S1|D3|S2], accreditation)
groups (gugus)       (id, code UNIQUE, name, faculty_id? FK, mentor_id? FK users, batch, timestamps)
users                (id, nim UNIQUE?, email UNIQUE, name, password, role,
                      gender[L|P], phone?, faculty_id?, study_program_id?, group_id?,
                      batch?, avatar_path?, points INT DEFAULT 0, is_active,
                      accessibility_needs TEXT?, last_login_at, timestamps)
                      INDEX(role), INDEX(group_id)
sessions_pkkmb       (id, title, description, type[UNIVERSITAS|FAKULTAS|PRODI|PRE],
                      mode[ONLINE|OFFLINE], batch?, faculty_id?, day_number,
                      starts_at, ends_at, location, latitude?, longitude?, radius_m?,
                      online_code?, attendance_open BOOL, points INT, timestamps)
                      * nama tabel `sessions_pkkmb` karena `sessions` dipakai Laravel.
attendances          (id, session_id FK, user_id FK, method[QR|CODE|MANUAL],
                      status[HADIR|TERLAMBAT|IZIN], latitude?, longitude?,
                      scanned_by? FK users, created_at)  UNIQUE(session_id,user_id)
materials            (id, session_id? FK, title, description, type[PDF|VIDEO|LINK],
                      file_path?, url?, order, timestamps)
quizzes              (id, material_id FK, title, pass_score, points)
quiz_questions       (id, quiz_id FK, question, options JSON, answer_index)
quiz_attempts        (id, quiz_id FK, user_id FK, score, answers JSON, created_at)
assignments          (id, session_id? FK, title, description, type[FILE|LINK|TEXT],
                      due_at, max_score, points, is_required, timestamps)
submissions          (id, assignment_id FK, user_id FK, file_path?, url?, text?,
                      status[SUBMITTED|GRADED|REVISION], score?, feedback?, graded_by? FK,
                      submitted_at, graded_at)  UNIQUE(assignment_id,user_id)
badges               (id, code UNIQUE, name, description, icon, points)
badge_user           (badge_id, user_id, awarded_at) PK(badge_id,user_id)
missions             (id, title, description, date, points, code?)   -- misi harian
mission_user         (mission_id, user_id, completed_at)
announcements        (id, title, body, category, audience[ALL|MABA|MENTOR|GROUP|FACULTY],
                      group_id?, faculty_id?, is_pinned, published_at, author_id FK, timestamps)
tickets              (id, code UNIQUE, user_id? FK, category[BANTUAN|PENGADUAN|KEKERASAN],
                      subject, body, priority[LOW|MEDIUM|HIGH|URGENT],
                      status[OPEN|IN_PROGRESS|RESOLVED|CLOSED], is_anonymous,
                      reporter_token_hash?, contact?, assigned_to? FK, timestamps)
ticket_replies       (id, ticket_id FK, user_id? FK, body, is_staff, created_at)
certificates         (id, user_id FK UNIQUE, number UNIQUE, verify_hash UNIQUE,
                      issued_at, file_path?)
audit_logs           (id, user_id? FK, action, subject_type, subject_id, changes JSON,
                      ip, user_agent, created_at)  INDEX(subject_type,subject_id)
faqs                 (id, question, answer, category, order)
gallery_items        (id, title, image_path, caption, taken_at)
organizations (UKM)  (id, name, category, description, instagram, logo_path)
campus_places        (id, name, category, description, latitude, longitude, image_path)
settings             (key PK, value JSON)
personal_access_tokens (Sanctum)
```

Relasi inti: `Faculty 1─* StudyProgram`, `Faculty 1─* Group`, `Group 1─* User(MABA)`,
`Group *─1 User(MENTOR)`, `Session 1─* Attendance *─1 User`, `Assignment 1─* Submission`,
`Material 1─1 Quiz 1─* QuizQuestion`, `User *─* Badge`, `User 1─1 Certificate`.

### Syarat sertifikat (dapat diatur di `settings.certificate_rules`)
- Kehadiran ≥ 80% sesi wajib (`type` UNIVERSITAS & FAKULTAS),
- Semua tugas `is_required` berstatus `GRADED` dengan nilai ≥ 60.

## 3. Sitemap

```
/                          Landing (hero tema, countdown, teaser, sambutan, statistik)
/tentang                   Tujuan, nilai, tata tertib, komitmen anti-perpeloncoan
/jadwal                    Timeline interaktif (filter hari/batch/fakultas)
/atribut                   Dress code putra/putri + checklist
/kampus                    Peta kampus interaktif + virtual tour 360°
/fakultas                  Kartu fakultas & prodi
/ukm                       Direktori UKM
/pengumuman, /pengumuman/[id]
/galeri
/faq                       FAQ + pencarian
/kontak                    Hotline + formulir pengaduan anonim
/lapor/status              Cek status laporan anonim (kode + token)
/verifikasi/[hash]         Verifikasi sertifikat publik (tanpa data pribadi sensitif)
/login

/dashboard                 (MABA) ringkasan, misi harian, pengumuman
/dashboard/jadwal          jadwal personal
/dashboard/presensi        scan QR / input kode sesi
/dashboard/tugas, /dashboard/tugas/[id]
/dashboard/materi, /dashboard/materi/[id] (+ kuis)
/dashboard/gamifikasi      poin, badge, leaderboard gugus
/dashboard/kartu           kartu identitas digital (unduh PNG)
/dashboard/sertifikat
/dashboard/asisten         chatbot PKKMB
/dashboard/bantuan         tiket bantuan

/mentor                    gugus saya: anggota, rekap presensi
/mentor/penilaian          nilai tugas anggota
/mentor/scanner            scanner QR kamera (mode panitia: scan kartu maba)
/mentor/pengumuman         kirim pengumuman ke gugus

/admin                     analitik
/admin/sesi                CRUD sesi + tampilkan QR dinamis di layar
/admin/konten              CRUD pengumuman, FAQ, materi, tugas, galeri, fakultas, UKM
/admin/pengguna            import CSV, pembagian gugus otomatis
/admin/tiket               manajemen tiket
/admin/audit               audit log
/admin/pengaturan          tema PKKMB (judul, tagline, tanggal)
```

## 4. Kontrak API (ringkas) — prefix `/api/v1`

| Method | Path | Role | Keterangan |
|---|---|---|---|
| POST | /auth/login | publik (throttle 5/menit) | `{nim, password}` → token |
| POST | /auth/sso/callback | publik | adapter SSO (mock) |
| POST | /auth/logout, GET /auth/me | auth | |
| GET | /public/settings, /public/stats, /public/sessions, /public/faculties, /public/organizations, /public/faqs, /public/announcements, /public/gallery, /public/places | publik (cache) | |
| POST | /public/reports | publik (throttle) | pengaduan anonim → `{code, token}` |
| GET | /public/reports/{code}?token= | publik | cek status |
| GET | /public/certificates/{hash} | publik | verifikasi |
| GET | /me/dashboard, /me/schedule, /me/badges, /me/leaderboard, /me/card | MABA | |
| POST | /attendance/qr | MABA (throttle 10/menit) | `{token, lat?, lng?}` |
| POST | /attendance/code | MABA | `{session_id, code}` |
| GET/POST | /assignments, /assignments/{id}/submit | MABA | upload ≤ 10 MB pdf/jpg/png |
| GET/POST | /materials, /quizzes/{id}/attempt | MABA | |
| GET/POST | /certificate, /certificate/download | MABA | |
| POST | /assistant/ask | auth (throttle) | chatbot berbasis FAQ (+LLM opsional) |
| GET/POST | /tickets, /tickets/{id}/replies | auth | |
| GET | /announcements/stream | auth | SSE |
| GET | /mentor/group, /mentor/submissions; POST /mentor/submissions/{id}/grade, /mentor/scan, /mentor/announcements | MENTOR/PANITIA | Policy: hanya gugus sendiri |
| CRUD | /admin/{sessions,materials,assignments,announcements,faqs,gallery,faculties,organizations} | ADMIN (PANITIA: sebagian) | diaudit |
| GET | /admin/sessions/{id}/qr | ADMIN/PANITIA | token QR berjalan (refresh 30 dtk) |
| POST | /admin/import/users, /admin/groups/auto-assign | ADMIN | |
| GET | /admin/analytics, /admin/export/attendance | ADMIN | |
| GET/PATCH | /admin/tickets, /admin/audit-logs, /admin/settings | ADMIN | |
