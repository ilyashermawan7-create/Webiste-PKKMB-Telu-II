<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\Badge;
use App\Models\CampusPlace;
use App\Models\Faculty;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\Material;
use App\Models\Mission;
use App\Models\Organization;
use App\Models\PkkmbSession;
use App\Models\Quiz;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Konten PKKMB: pengaturan tema, sesi, materi + kuis, tugas, gamifikasi, pengumuman, FAQ, UKM, peta.
 * Tanggal dibuat relatif terhadap hari ini agar demo (countdown, presensi) langsung bisa dicoba.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $hariH = Carbon::today()->addDays(10)->setTime(7, 0);
        $frontend = rtrim(config('app.frontend_url'), '/');

        // ---------- Pengaturan tema ----------
        $settings = [
            'theme_title' => 'Bersinergi, Berdaya, Berdampak',
            'theme_tagline' => 'Young TeluTizen siap Creating the Future untuk Indonesia',
            'year' => (int) $hariH->year,
            'event_start' => $hariH->toIso8601String(),
            'event_end' => $hariH->copy()->addDays(4)->setTime(16, 0)->toIso8601String(),
            'teaser_video_url' => null,
            'virtual_tour_url' => null,
            'hotline_whatsapp' => '6281200000000',
            'hotline_email' => 'pkkmb@telkomuniversity.ac.id',
            'instagram' => 'pkkmbtelu',
            'rector_message' => 'Selamat datang, Young TeluTizen! Kalian kini bagian dari keluarga besar Telkom University. Jadikan masa kuliah sebagai ruang untuk bertumbuh, berkolaborasi, dan menciptakan dampak nyata bagi bangsa.',
            'director_message' => 'PKKMB adalah langkah pertama untuk mengenal kampus, nilai-nilai, dan sesama. Kami berkomitmen menyelenggarakan PKKMB yang edukatif, inklusif, dan bebas perpeloncoan.',
            'certificate_rules' => ['min_attendance' => 0.8, 'min_score' => 60],
        ];
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // ---------- Sesi ----------
        $tuch = ['latitude' => -6.9748, 'longitude' => 107.6305, 'radius_m' => 300]; // koordinat perkiraan, sesuaikan
        $sessions = [
            ['Pre-PKKMB: Orientasi Daring & Literasi Digital', 'PRE', 'ONLINE', null, 0, Carbon::today()->subDays(3)->setTime(9, 0), 120, 'Zoom & YouTube Live', ['online_code' => 'TELU26']],
            ['Simulasi Presensi QR (Demo)', 'UNIVERSITAS', 'OFFLINE', null, 0, Carbon::now()->subMinutes(20), 600, 'TULT Lt. 1 (demo)', ['attendance_open' => true]],
            ['Pembukaan PKKMB & Sambutan Rektor', 'UNIVERSITAS', 'OFFLINE', 1, 1, $hariH, 180, 'Telkom University Convention Hall (TUCH)', $tuch],
            ['Wawasan Kebangsaan & Bela Negara', 'UNIVERSITAS', 'OFFLINE', 1, 1, $hariH->copy()->setTime(10, 30), 90, 'TUCH', $tuch],
            ['Anti Kekerasan Seksual, Perundungan & Narkoba', 'UNIVERSITAS', 'OFFLINE', 2, 2, $hariH->copy()->addDay()->setTime(8, 0), 120, 'Kelas TULT', []],
            ['Sistem Akademik, LMS & Kehidupan Kampus', 'UNIVERSITAS', 'OFFLINE', 2, 2, $hariH->copy()->addDay()->setTime(10, 30), 90, 'Kelas TULT', []],
            ['Kesehatan Mental & Manajemen Diri', 'UNIVERSITAS', 'ONLINE', null, 2, $hariH->copy()->addDay()->setTime(13, 0), 90, 'Zoom', ['online_code' => 'SEHAT1']],
            ['Expo UKM & Explorer Kampus', 'UNIVERSITAS', 'OFFLINE', null, 3, $hariH->copy()->addDays(2)->setTime(13, 0), 180, 'Area Kampus', []],
            ['Kewirausahaan & Inovasi Digital', 'UNIVERSITAS', 'OFFLINE', 3, 3, $hariH->copy()->addDays(2)->setTime(8, 0), 120, 'TUCH', $tuch],
        ];
        foreach ($sessions as [$title, $type, $mode, $batch, $day, $start, $minutes, $loc, $extra]) {
            PkkmbSession::updateOrCreate(['title' => $title], array_merge([
                'description' => "Sesi {$title} untuk seluruh Young TeluTizen.",
                'type' => $type, 'mode' => $mode, 'batch' => $batch, 'day_number' => $day,
                'starts_at' => $start, 'ends_at' => $start->copy()->addMinutes($minutes), 'location' => $loc,
                'points' => $type === 'PRE' ? 10 : 20,
            ], $extra));
        }
        foreach (Faculty::all() as $f) {
            PkkmbSession::updateOrCreate(['title' => "PKKMB Fakultas {$f->code}: Mengenal Fakultas & Prodi"], [
                'description' => "Sambutan Dekan {$f->name}, pengenalan prodi, himpunan, dan laboratorium.",
                'type' => 'FAKULTAS', 'mode' => 'OFFLINE', 'faculty_id' => $f->id, 'day_number' => 4,
                'starts_at' => $hariH->copy()->addDays(3)->setTime(8, 0), 'ends_at' => $hariH->copy()->addDays(3)->setTime(12, 0),
                'location' => "Gedung {$f->code}", 'points' => 20,
            ]);
        }

        // ---------- Materi + kuis ----------
        $materials = [
            ['Buku Panduan PKKMB Telkom University', 'PDF', null, [
                ['Berapa persen kehadiran minimal untuk mendapatkan sertifikat PKKMB?', ['50%', '70%', '80%', '100%'], 2],
                ['Ke mana melaporkan tindakan perpeloncoan secara anonim?', ['Media sosial pribadi', 'Formulir pengaduan anonim di website PKKMB', 'Grup angkatan', 'Tidak perlu dilaporkan'], 1],
                ['Apa motto Telkom University?', ['Creating the Future', 'Building the Nation', 'Leading the Way', 'Go Digital'], 0],
            ]],
            ['Wawasan Kebangsaan & Bela Negara', 'VIDEO', null, [
                ['Apa semboyan negara Indonesia?', ['Bhinneka Tunggal Ika', 'Tut Wuri Handayani', 'Gotong Royong', 'Satu Nusa'], 0],
                ['Dasar negara Indonesia adalah…', ['UUD 1945', 'Pancasila', 'Tap MPR', 'Sumpah Pemuda'], 1],
            ]],
            ['Pencegahan Kekerasan Seksual & Perundungan', 'PDF', null, [
                ['Persetujuan (consent) yang sah harus…', ['Diberikan dalam tekanan', 'Sukarela dan dapat ditarik kapan saja', 'Diwakilkan teman', 'Tidak diperlukan'], 1],
                ['Satgas PPKS bertugas…', ['Menghukum korban', 'Menangani & mencegah kekerasan seksual di kampus', 'Mengatur jadwal kuliah', 'Mengelola UKM'], 1],
            ]],
            ['Kenali LMS & Sistem Akademik', 'LINK', 'https://lms.telkomuniversity.ac.id', [
                ['KRS adalah singkatan dari…', ['Kartu Rencana Studi', 'Kartu Riwayat Siswa', 'Kelas Rutin Semester', 'Kode Registrasi Sistem'], 0],
            ]],
        ];
        foreach ($materials as $i => [$title, $type, $url, $questions]) {
            $m = Material::updateOrCreate(['title' => $title], ['type' => $type, 'url' => $url, 'order' => $i + 1,
                'description' => "Materi {$title}. Pelajari sebelum mengerjakan kuis singkat."]);
            $quiz = Quiz::updateOrCreate(['material_id' => $m->id], ['title' => "Kuis: {$title}", 'pass_score' => 70, 'points' => 15]);
            $quiz->questions()->delete();
            foreach ($questions as [$q, $opts, $ans]) {
                $quiz->questions()->create(['question' => $q, 'options' => $opts, 'answer_index' => $ans]);
            }
        }

        // ---------- Tugas ----------
        $assignments = [
            ['Esai: Aku dan Mimpiku untuk Indonesia', 'Tulis esai 500–700 kata tentang cita-citamu dan kontribusimu untuk Indonesia. Unggah dalam format PDF.', 'FILE', 7, true],
            ['Video Perkenalan Gugus', 'Buat video perkenalan gugus maksimal 2 menit, unggah ke YouTube (unlisted) lalu kirimkan tautannya.', 'LINK', 12, true],
            ['Refleksi Hari Pertama', 'Tuliskan refleksi singkat (minimal 100 kata) tentang pengalaman hari pertama PKKMB.', 'TEXT', 11, false],
        ];
        foreach ($assignments as [$title, $desc, $type, $dueDays, $req]) {
            Assignment::updateOrCreate(['title' => $title], [
                'description' => $desc, 'type' => $type, 'due_at' => Carbon::today()->addDays($dueDays)->setTime(23, 59),
                'max_score' => 100, 'points' => 25, 'is_required' => $req,
            ]);
        }

        // ---------- Badge & misi ----------
        $badges = [
            ['FIRST_STEP', 'Langkah Pertama', 'Melakukan presensi pertama.', 'footprints', 5],
            ['EARLY_BIRD', 'Early Bird', 'Presensi di 10 menit pertama sesi.', 'sunrise', 10],
            ['EXPLORER', 'Explorer Kampus', 'Menjelajahi peta kampus interaktif.', 'map', 10],
            ['GERCEP', 'Gercep', 'Mengumpulkan tugas lebih dari sehari sebelum tenggat.', 'zap', 10],
            ['QUIZ_MASTER', 'Quiz Master', 'Mendapat nilai sempurna pada kuis.', 'brain', 15],
            ['KONSISTEN', 'Konsisten', 'Hadir di 5 sesi PKKMB.', 'flame', 20],
        ];
        foreach ($badges as [$code, $name, $desc, $icon, $pts]) {
            Badge::updateOrCreate(['code' => $code], ['name' => $name, 'description' => $desc, 'icon' => $icon, 'points' => $pts]);
        }
        Mission::where('date', '<', today()->subDays(7))->delete();
        foreach ([['Hadir tepat waktu', 'Lakukan presensi di sesi hari ini.', 'ATTEND', 10], ['Belajar sebentar', 'Lulus satu kuis materi.', 'QUIZ', 10],
            ['Jelajahi kampus', 'Buka peta kampus interaktif.', 'VISIT_MAP', 5], ['Cari tahu dulu', 'Baca halaman FAQ.', 'READ_FAQ', 5]] as [$t, $d, $a, $p]) {
            Mission::updateOrCreate(['date' => today()->toDateString(), 'action' => $a], ['title' => $t, 'description' => $d, 'points' => $p]);
        }

        // ---------- Pengumuman ----------
        $admin = User::where('role', 'ADMIN')->first();
        foreach ([
            ['Selamat datang, Young TeluTizen!', 'Akun PKKMB kamu sudah aktif. Lengkapi profil dan cek jadwal batch di dashboard.', 'Umum', true, 2],
            ['Pembagian gugus & mentor telah dirilis', 'Lihat gugus dan kontak mentormu di halaman Dashboard. Mentor akan menghubungi melalui grup resmi.', 'Gugus', false, 1],
            ['Ketentuan atribut & dress code', 'Pastikan atribut sesuai ketentuan di halaman Atribut. Sepatu hitam tertutup, kemeja putih polos.', 'Atribut', false, 1],
            ['Pengecekan kesehatan sebelum PKKMB', 'Maba dengan kondisi kesehatan khusus dapat melapor melalui tiket bantuan agar tim medis bersiap.', 'Kesehatan', false, 0],
        ] as [$title, $body, $cat, $pin, $daysAgo]) {
            Announcement::updateOrCreate(['title' => $title], [
                'body' => $body, 'category' => $cat, 'audience' => 'ALL', 'is_pinned' => $pin,
                'published_at' => now()->subDays($daysAgo), 'author_id' => $admin?->id,
            ]);
        }

        // ---------- FAQ ----------
        $faqs = [
            ['Umum', 'Apakah PKKMB wajib diikuti?', 'Ya. PKKMB wajib diikuti seluruh mahasiswa baru S1 dan D3 dan menjadi syarat penerbitan sertifikat PKKMB.'],
            ['Umum', 'Kapan PKKMB dilaksanakan?', 'Jadwal lengkap per batch tersedia di halaman Jadwal dan dashboard masing-masing.'],
            ['Presensi', 'Bagaimana cara presensi sesi offline?', 'Buka menu Presensi di dashboard, pindai QR dinamis yang ditampilkan di layar sesi. QR berganti setiap 30 detik, jadi pindai langsung di lokasi.'],
            ['Presensi', 'Bagaimana cara presensi sesi online?', 'Masukkan kode sesi yang dibacakan pemateri di menu Presensi dashboard.'],
            ['Presensi', 'Saya sakit, bagaimana izin tidak hadir?', 'Buat tiket bantuan kategori Bantuan berisi alasan dan lampiran surat keterangan. Mentor dan panitia akan memverifikasi.'],
            ['Tugas', 'Format file tugas apa yang diterima?', 'PDF, JPG, PNG, atau WEBP dengan ukuran maksimal 10 MB. Tugas video dikumpulkan berupa tautan.'],
            ['Sertifikat', 'Bagaimana mendapatkan sertifikat PKKMB?', 'Sertifikat terbit otomatis di dashboard jika kehadiran sesi wajib minimal 80% dan semua tugas wajib lulus.'],
            ['Keamanan', 'Bagaimana jika saya mengalami perpeloncoan atau kekerasan?', 'Segera laporkan melalui formulir pengaduan anonim di halaman Kontak atau hotline PKKMB. Identitasmu dirahasiakan.'],
            ['Inklusivitas', 'Apakah ada fasilitas untuk mahasiswa disabilitas?', 'Ada. Isi kebutuhan aksesibilitas di profil; panitia menyiapkan pendamping, akses kursi roda, dan juru bahasa isyarat.'],
            ['Atribut', 'Bolehkah memakai sepatu sneakers?', 'Boleh, asalkan berwarna hitam polos dan tertutup. Hindari sepatu berhak tinggi dan sandal.'],
        ];
        foreach ($faqs as $i => [$cat, $q, $a]) {
            Faq::updateOrCreate(['question' => $q], ['answer' => $a, 'category' => $cat, 'order' => $i]);
        }

        // ---------- UKM ----------
        $orgs = [
            ['Teknologi', 'UKM Robotika', 'Riset robotika dan kompetisi KRI tingkat nasional.'], ['Teknologi', 'Google Developer Student Club', 'Komunitas developer untuk belajar teknologi Google.'],
            ['Teknologi', 'UKM Cyber Security', 'Belajar keamanan siber dan kompetisi CTF.'], ['Seni', 'Paduan Suara Mahasiswa', 'Paduan suara dengan prestasi internasional.'],
            ['Seni', 'UKM Tari Tradisional', 'Melestarikan tari nusantara.'], ['Seni', 'UKM Fotografi', 'Hunting, pameran, dan kelas fotografi.'],
            ['Olahraga', 'UKM Basket', 'Latihan rutin dan liga antar kampus.'], ['Olahraga', 'UKM Futsal', 'Tim futsal putra & putri.'],
            ['Olahraga', 'UKM Badminton', 'Pembinaan atlet bulu tangkis kampus.'], ['Olahraga', 'UKM E-Sports', 'Tim e-sports kompetitif.'],
            ['Kerohanian', 'Lembaga Dakwah Kampus', 'Kajian dan kegiatan sosial keagamaan Islam.'], ['Kerohanian', 'Persekutuan Mahasiswa Kristen', 'Ibadah dan pembinaan rohani.'],
            ['Sosial', 'Korps Sukarela PMI', 'Pertolongan pertama dan aksi kemanusiaan.'], ['Sosial', 'UKM Pecinta Alam', 'Pendakian, konservasi, dan SAR.'],
            ['Penalaran', 'UKM Riset & Karya Tulis', 'PKM, lomba karya tulis, dan riset mahasiswa.'], ['Penalaran', 'English Club', 'Debat bahasa Inggris dan public speaking.'],
        ];
        foreach ($orgs as [$cat, $name, $desc]) {
            Organization::updateOrCreate(['name' => $name], ['category' => $cat, 'description' => $desc]);
        }

        // ---------- Peta kampus (koordinat perkiraan, verifikasi dengan tim sarpras) ----------
        $places = [
            ['Telkom University Landmark Tower (TULT)', 'Akademik', 'Gedung kuliah & laboratorium terpadu, lokasi kelas PKKMB.', -6.9691, 107.6283],
            ['Telkom University Convention Hall (TUCH)', 'Acara', 'Lokasi pembukaan & PKKMB Universitas.', -6.9748, 107.6305],
            ['Gedung Rektorat (Bangkit)', 'Layanan', 'Rektorat dan layanan administrasi.', -6.9735, 107.6302],
            ['Masjid Syamsul Ulum', 'Ibadah', 'Masjid kampus.', -6.9739, 107.6311],
            ['Asrama Mahasiswa', 'Hunian', 'Asrama mahasiswa tahun pertama.', -6.9758, 107.6268],
            ['Klinik Telkom University', 'Kesehatan', 'Layanan kesehatan & P3K selama PKKMB.', -6.9731, 107.6296],
            ['Open Library', 'Akademik', 'Perpustakaan pusat dan ruang belajar.', -6.9718, 107.6315],
            ['Student Center', 'Kemahasiswaan', 'Sekretariat UKM dan kegiatan mahasiswa.', -6.9725, 107.6322],
        ];
        foreach ($places as [$name, $cat, $desc, $lat, $lng]) {
            CampusPlace::updateOrCreate(['name' => $name], ['category' => $cat, 'description' => $desc, 'latitude' => $lat, 'longitude' => $lng]);
        }

        // ---------- Galeri (ilustrasi placeholder; ganti dengan foto dokumentasi resmi) ----------
        foreach (['Pembukaan PKKMB', 'Expo UKM', 'Kelas Gugus', 'Explorer Kampus', 'Malam Apresiasi', 'Penutupan'] as $i => $title) {
            GalleryItem::updateOrCreate(['title' => $title], [
                'image_path' => "{$frontend}/images/gallery/".($i + 1).'.svg',
                'caption' => "Dokumentasi {$title} PKKMB tahun lalu.",
                'taken_at' => now()->subYear()->subDays(6 - $i)->toDateString(),
            ]);
        }
    }
}
