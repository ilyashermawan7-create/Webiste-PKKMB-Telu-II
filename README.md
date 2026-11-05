# Website PKKMB Telkom University

Website resmi **Pengenalan Kehidupan Kampus bagi Mahasiswa Baru (PKKMB) Telkom University**,
diselenggarakan Direktorat Kemahasiswaan, untuk ±8.000 **Young TeluTizen**, mentor, panitia, dan admin.

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · komponen gaya shadcn/ui (Radix) · Framer Motion · Lucide · React Hook Form + Zod · next-intl (ID/EN) · Recharts · PWA |
| Backend | Laravel 12 (REST API `/api/v1`) · Sanctum · PostgreSQL · Redis (cache, rate limit, queue) · S3 (MinIO/Cloudflare R2) · DomPDF + QR · SSE |
| Infra | Docker + docker-compose (Postgres, Redis, MinIO, API, worker queue, scheduler, frontend) |

Dokumen desain lengkap (arsitektur, skema database, sitemap, kontrak API): **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

```
.
├── backend/        Laravel 12 API (migrasi, model, controller, policy, seeder, tes)
├── frontend/       Next.js 15 (halaman publik + dashboard Maba/Mentor/Admin)
├── docs/           Dokumen arsitektur
└── docker-compose.yml
```

## Fitur

**Publik:** landing (tema dari CMS, countdown hari-H, teaser video, sambutan Rektor & Direktur Kemahasiswaan, statistik), Tentang (tujuan, nilai, tata tertib, komitmen anti-perpeloncoan), jadwal interaktif (filter hari/batch/fakultas), atribut & dress code dengan ilustrasi + checklist, peta kampus interaktif + slot virtual tour 360°, fakultas & prodi, direktori UKM, pengumuman, galeri, FAQ dengan pencarian, kontak & hotline, **formulir pengaduan anonim** (kode + token untuk cek status), verifikasi sertifikat via QR.

**Dashboard maba:** ringkasan (gugus, mentor, sesi berikutnya, progres sertifikat, misi harian), jadwal personal + status hadir, **presensi QR dinamis** (berganti tiap 30 detik, geofence opsional) & kode sesi daring, penugasan (upload PDF/gambar, tautan, teks) + nilai & feedback, materi + kuis, gamifikasi (poin, badge, misi harian, **leaderboard per gugus**), kartu identitas digital (QR, unduh PNG), sertifikat PDF otomatis, asisten AI (FAQ + dokumen resmi, tombol "Hubungi panitia"), tiket bantuan, profil (kebutuhan aksesibilitas, ganti sandi). Pengumuman tampil **live** (SSE) + notifikasi browser.

**Mentor/panitia:** rekap gugus (matriks presensi, tugas, poin, export CSV), penilaian tugas, scanner QR kartu maba via kamera HP, kirim pengumuman ke gugus.

**Admin:** analitik (kehadiran per sesi, sebaran fakultas, progres tugas, export Excel/CSV & PDF), operasional sesi (buka/tutup presensi, **layar QR proyektor**), CRUD konten (sesi, pengumuman, materi, tugas, FAQ, galeri, fakultas, UKM, lokasi, badge, misi), import CSV maba/mentor, **pembagian gugus otomatis** (seimbang per fakultas & gender), penetapan mentor, manajemen tiket berprioritas, audit log, pengaturan tema tanpa ubah kode.

## Menjalankan secara lokal

Prasyarat: PHP 8.3 (ext: pdo_pgsql, redis, gd, intl, zip), Composer 2, Node.js 22, PostgreSQL 16, Redis 7.

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Buat database (sesuaikan dengan `.env`):

```bash
createdb pkkmb
```

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8000
```

> `php artisan serve` hanya satu proses, karena itu `.env.example` memakai `SSE_MAX_SECONDS=0`
> (pengumuman live menjadi long-polling ±5 detik). Di Docker/PHP-FPM nilainya 55.

Opsional: worker queue (email) dan scheduler (pengingat H-1):

```bash
php artisan queue:work
```

```bash
php artisan schedule:work
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Buka http://localhost:3000.

### Akun demo (kata sandi: `password`)

| Role | Login |
|---|---|
| Maba | `1301260001` |
| Mentor | `mentor@pkkmb.telkomuniversity.ac.id` |
| Panitia | `panitia@pkkmb.telkomuniversity.ac.id` |
| Admin | `admin@pkkmb.telkomuniversity.ac.id` |

Seeder juga membuat 7 fakultas Tel-U (FTE, FRI, FIF, FEB, FKB, FIK, FIT) + 32 prodi, 29 mentor, 280 maba dummy (`SEED_MABA`),
gugus hasil pembagian otomatis, sesi (termasuk **"Simulasi Presensi QR (Demo)"** yang sedang terbuka), materi + kuis, tugas, badge, misi, FAQ, UKM, dan lokasi kampus.
Coba: login admin → *Sesi & QR* → *Tampilkan QR*, lalu login maba di HP → *Presensi* → pindai.

### Tes

```bash
cd backend && php artisan test
```

```bash
cd frontend && npm run lint && npx tsc --noEmit && npm run build
```

Tes backend mencakup: login, QR dinamis (valid / kedaluwarsa / palsu), presensi idempoten, geofence, otorisasi role, anti-IDOR mentor, laporan anonim, penolakan file berbahaya, dan kebocoran data publik.

## Variabel lingkungan

**backend/.env** (lihat `backend/.env.example`): `DB_*`, `REDIS_*`, `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`,
`UPLOADS_DISK` / `UPLOADS_PUBLIC_DISK` (`local`/`public` atau `s3`/`s3_public`), `AWS_*` (MinIO/R2), `MAIL_*` (Resend SMTP),
`FRONTEND_URL`, `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL` (opsional; tanpa key, asisten menjawab dari FAQ saja), `SSO_DRIVER`, `SSE_MAX_SECONDS`, `TRUSTED_PROXIES`.

**frontend/.env.local** (lihat `frontend/.env.example`): `API_URL`, `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET` (≥ 32 karakter acak), `NEXT_PUBLIC_DEMO_MODE`.

## Docker

```bash
cp .env.docker.example .env
```

Isi `APP_KEY` dan `SESSION_SECRET` di `.env`, lalu:

```bash
docker compose up -d --build
```

Layanan: frontend `:3000`, API `:8000`, konsol MinIO `:9001`. Container `backend` menjalankan migrasi otomatis
(dan seeder bila `SEED_DEMO=true`). `queue` & `scheduler` memakai image yang sama.

## Deploy

**VPS (disarankan untuk hari-H):** jalankan docker-compose di belakang Nginx/Caddy (TLS). Set `SEED_DEMO=false`, `DEMO_MODE=false`,
`APP_DEBUG=false`. Arahkan domain `pkkmb.telkomuniversity.ac.id` → frontend, `api.pkkmb…` → backend (atau proxy `/api/v1`).

**Serverless:** frontend di **Vercel** (set env di dashboard Vercel; `API_URL` ke backend publik), backend di VPS/Laravel Cloud/Forge,
database **Neon/Supabase** Postgres (`DB_HOST`, `DB_SSLMODE=require`), Redis Upstash, storage **Cloudflare R2** (`AWS_ENDPOINT=https://<akun>.r2.cloudflarestorage.com`).

**Kesiapan lonjakan presensi (±8.000 serentak):** validasi QR tanpa query DB (HMAC), satu `INSERT … ON CONFLICT DO NOTHING`
per presensi (unik `session_id,user_id`), data sesi di-cache Redis, rate limit per user, OPcache+JIT, PHP-FPM 64 worker/replika.
Lakukan uji beban (mis. k6) di staging dan tambahkan replika `backend` di belakang load balancer bila p95 > 300 ms.

## Keamanan & privasi

- Password bcrypt; token Sanctum disimpan Next.js di cookie **httpOnly** (browser tidak pernah memegang token); cookie role ditandatangani HMAC.
- Proteksi CSRF di BFF (cek `Origin` untuk request non-GET) + SameSite=Lax; validasi server dengan FormRequest/`validate()` dan Zod di klien.
- Rate limit Redis: login 5/menit, presensi 10/menit, upload, asisten, laporan anonim.
- Upload: MIME dari isi file (bukan ekstensi), ≤ 10 MB, nama acak, disk privat, akses via **signed URL** 30 menit.
- Anti-IDOR: middleware role + Policy (mentor hanya gugusnya; laporan kekerasan hanya PANITIA/ADMIN).
- UU PDP: endpoint publik tanpa data pribadi; data pribadi hanya untuk pemilik/staf; laporan anonim tidak menyimpan user ID maupun IP.
- Audit log otomatis untuk semua aksi tulis staf (field sensitif disamarkan); header keamanan di API & frontend.

## Aksesibilitas (WCAG 2.1 AA)

Skip link, fokus terlihat, navigasi keyboard, label ARIA, `prefers-reduced-motion`, pengatur ukuran teks (A/A+/A++), dark mode,
tabel alternatif untuk grafik. Merah Tel-U `#ED1E28` di atas putih (4.4:1) hanya untuk elemen besar/dekoratif;
teks kecil memakai maroon `#B6252A` (6.2:1) atau `#C4141D`.

## Catatan implementasi & penyesuaian dari brief

- **Backend Laravel** (sesuai permintaan) menggantikan Prisma/Auth.js: skema diwujudkan sebagai migrasi Laravel; tabel `Role` menjadi enum kolom `users.role`.
- **Tailwind v4** memakai konfigurasi CSS (`@theme` di `frontend/src/app/globals.css`) sebagai pengganti `tailwind.config`.
- **Logo** di `frontend/public/brand/` masih **placeholder**; ganti dengan file resmi (lihat `public/brand/README.md`). Font "TelU Typeface" dipakai otomatis bila terpasang; fallback Plus Jakarta Sans & Inter.
- **Import data** memakai CSV (Excel → *Save As CSV UTF-8*); export presensi berupa CSV ber-BOM yang langsung terbuka di Excel, laporan ringkas dalam PDF.
- **SSO kampus**: kontrak `SsoProvider` + `MockSsoProvider`; tombol SSO di halaman login dinonaktifkan sampai adapter resmi tersedia.
- **Notifikasi**: pengumuman live (SSE) + Notification API browser, service worker siap menerima push, dan email pengingat H-1 via scheduler. Web Push dari server (VAPID) belum diimplementasikan.
- Koordinat peta, nomor hotline, tema, dan konten seeder adalah **contoh**; perbarui lewat dashboard admin sebelum rilis.
- Halaman publik dirender per request (cookie bahasa), sedangkan data API di-cache (ISR fetch 1–60 menit).
