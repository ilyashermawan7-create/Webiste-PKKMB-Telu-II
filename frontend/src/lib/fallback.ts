/**
 * Konten cadangan untuk halaman publik saat API Laravel belum bisa dijangkau
 * (mis. ketika `next build` dijalankan tanpa backend). Sumber kebenaran tetap database.
 */
import type { Announcement, CampusPlace, Faculty, Faq, GalleryItem, Organization, PkkmbSession, PublicSettings, PublicStats } from "./types";

export const fallbackSettings: PublicSettings = {
  theme_title: "Bersinergi, Berdaya, Berdampak",
  theme_tagline: "Young TeluTizen siap Creating the Future untuk Indonesia",
  year: 2026,
  event_start: "2027-08-16T07:00:00+07:00",
  event_end: "2027-08-21T17:00:00+07:00",
  teaser_video_url: null,
  hotline_whatsapp: "6281200000000",
  hotline_email: "pkkmb@telkomuniversity.ac.id",
  instagram: "pkkmbtelu",
  virtual_tour_url: null,
};

export const fallbackStats: PublicStats = { maba: 8000, faculties: 7, study_programs: 38, groups: 320, organizations: 24 };

export const fallbackFaculties: Faculty[] = [
  { id: 1, code: "FTE", name: "Fakultas Teknik Elektro", description: "Teknik Elektro, Telekomunikasi, Fisika, Komputer, dan Biomedis." , study_programs_count: 6 },
  { id: 2, code: "FRI", name: "Fakultas Rekayasa Industri", description: "Teknik Industri, Sistem Informasi, dan Teknik Logistik.", study_programs_count: 4 },
  { id: 3, code: "FIF", name: "Fakultas Informatika", description: "Informatika, Rekayasa Perangkat Lunak, Teknologi Informasi, dan Sains Data.", study_programs_count: 5 },
  { id: 4, code: "FEB", name: "Fakultas Ekonomi dan Bisnis", description: "Manajemen Bisnis Telekomunikasi & Informatika, Akuntansi, Bisnis Digital.", study_programs_count: 5 },
  { id: 5, code: "FKB", name: "Fakultas Komunikasi dan Bisnis", description: "Ilmu Komunikasi, Administrasi Bisnis, Digital Public Relations.", study_programs_count: 4 },
  { id: 6, code: "FIK", name: "Fakultas Industri Kreatif", description: "Desain Komunikasi Visual, Desain Interior, Desain Produk, Kriya, Film & Animasi.", study_programs_count: 6 },
  { id: 7, code: "FIT", name: "Fakultas Ilmu Terapan", description: "Program Diploma (D3) terapan: Teknologi Telekomunikasi, Sistem Informasi, Perhotelan, dll.", study_programs_count: 8 },
];

const d = (day: number, h: number, m = 0) => new Date(Date.UTC(2027, 7, 15 + day, h - 7, m)).toISOString();

export const fallbackSessions: PkkmbSession[] = [
  { id: 1, title: "Pre-PKKMB: Orientasi Daring & Literasi Digital", description: "Pengenalan LMS, akun SSO, dan etika digital.", type: "PRE", mode: "ONLINE", batch: null, day_number: 0, starts_at: d(-3, 9), ends_at: d(-3, 11), location: "Zoom / YouTube Live", attendance_open: false, points: 10 },
  { id: 2, title: "Pembukaan PKKMB & Sambutan Rektor", description: "Upacara pembukaan dan pengukuhan Young TeluTizen.", type: "UNIVERSITAS", mode: "OFFLINE", batch: 1, day_number: 1, starts_at: d(1, 7), ends_at: d(1, 10), location: "Telkom University Convention Hall (TUCH)", attendance_open: false, points: 20 },
  { id: 3, title: "Wawasan Kebangsaan & Bela Negara", description: "Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika.", type: "UNIVERSITAS", mode: "OFFLINE", batch: 1, day_number: 1, starts_at: d(1, 10, 30), ends_at: d(1, 12), location: "TUCH", attendance_open: false, points: 15 },
  { id: 4, title: "Anti Kekerasan Seksual, Perundungan & Narkoba", description: "Bersama Satgas PPKS Telkom University.", type: "UNIVERSITAS", mode: "OFFLINE", batch: 2, day_number: 2, starts_at: d(2, 8), ends_at: d(2, 10), location: "Kelas Gedung TULT", attendance_open: false, points: 15 },
  { id: 5, title: "Sistem Akademik & Kehidupan Kampus", description: "SKS, KRS, LMS, layanan kemahasiswaan, beasiswa.", type: "UNIVERSITAS", mode: "OFFLINE", batch: 2, day_number: 2, starts_at: d(2, 10, 30), ends_at: d(2, 12), location: "Kelas Gedung TULT", attendance_open: false, points: 15 },
  { id: 6, title: "Expo UKM & Explorer Kampus", description: "Jelajah kampus dengan misi QR di tiap gedung.", type: "UNIVERSITAS", mode: "OFFLINE", batch: null, day_number: 3, starts_at: d(3, 13), ends_at: d(3, 16), location: "Area Kampus", attendance_open: false, points: 25 },
  { id: 7, title: "PKKMB Fakultas: Mengenal Fakultas & Prodi", description: "Dekan, kaprodi, himpunan mahasiswa.", type: "FAKULTAS", mode: "OFFLINE", batch: null, day_number: 4, starts_at: d(4, 8), ends_at: d(4, 12), location: "Gedung Fakultas", attendance_open: false, points: 20 },
];

export const fallbackAnnouncements: Announcement[] = [
  { id: 1, title: "Jadwal batch PKKMB Universitas telah dirilis", body: "Cek pembagian batch dan ruang kelas di dashboard masing-masing.", category: "Jadwal", audience: "ALL", is_pinned: true, published_at: "2026-11-01T08:00:00+07:00", author: { name: "Panitia PKKMB" } },
  { id: 2, title: "Ketentuan atribut & dress code", body: "Lihat halaman Atribut untuk checklist lengkap putra & putri.", category: "Atribut", audience: "ALL", is_pinned: false, published_at: "2026-10-28T08:00:00+07:00", author: { name: "Panitia PKKMB" } },
];

export const fallbackFaqs: Faq[] = [
  { id: 1, question: "Apakah PKKMB wajib diikuti?", answer: "Ya. PKKMB merupakan kegiatan wajib bagi seluruh mahasiswa baru dan menjadi syarat penerbitan sertifikat PKKMB.", category: "Umum" },
  { id: 2, question: "Bagaimana cara presensi?", answer: "Sesi offline: scan QR dinamis yang ditampilkan panitia di layar melalui menu Presensi. Sesi online: masukkan kode sesi yang diumumkan.", category: "Presensi" },
  { id: 3, question: "Saya sakit dan tidak bisa hadir, bagaimana?", answer: "Buat tiket bantuan kategori izin di dashboard dan lampirkan surat keterangan. Mentor gugus akan memverifikasi.", category: "Presensi" },
  { id: 4, question: "Bagaimana jika saya mengalami perpeloncoan atau kekerasan?", answer: "Laporkan melalui formulir pengaduan anonim di halaman Kontak atau hotline PKKMB. Identitas pelapor dijamin kerahasiaannya.", category: "Keamanan" },
  { id: 5, question: "Apakah ada fasilitas untuk mahasiswa disabilitas?", answer: "Ada. Isi kebutuhan aksesibilitas di profil; panitia menyiapkan pendamping, akses kursi roda, dan juru bahasa isyarat sesuai kebutuhan.", category: "Inklusivitas" },
];

export const fallbackOrganizations: Organization[] = [
  { id: 1, name: "UKM Robotik", category: "Teknologi", description: "Riset dan kompetisi robotika nasional & internasional.", instagram: null },
  { id: 2, name: "Paduan Suara Mahasiswa", category: "Seni", description: "Paduan suara kampus dengan prestasi internasional.", instagram: null },
  { id: 3, name: "UKM Basket", category: "Olahraga", description: "Latihan rutin dan liga antar kampus.", instagram: null },
  { id: 4, name: "Lembaga Dakwah Kampus", category: "Kerohanian", description: "Kajian dan kegiatan sosial keagamaan.", instagram: null },
];

export const fallbackGallery: GalleryItem[] = [];

export const fallbackPlaces: CampusPlace[] = [
  { id: 1, name: "Telkom University Landmark Tower (TULT)", category: "Akademik", description: "Gedung kuliah & laboratorium terpadu.", latitude: -6.9691, longitude: 107.6283 },
  { id: 2, name: "Telkom University Convention Hall (TUCH)", category: "Acara", description: "Lokasi pembukaan & PKKMB Universitas.", latitude: -6.9748, longitude: 107.6305 },
  { id: 3, name: "Masjid Syamsul Ulum", category: "Ibadah", description: "Masjid kampus.", latitude: -6.9739, longitude: 107.6311 },
  { id: 4, name: "Asrama Mahasiswa", category: "Hunian", description: "Asrama mahasiswa tahun pertama.", latitude: -6.9758, longitude: 107.6268 },
  { id: 5, name: "Klinik Telkom University", category: "Kesehatan", description: "Layanan kesehatan & P3K selama PKKMB.", latitude: -6.9731, longitude: 107.6296 },
];
