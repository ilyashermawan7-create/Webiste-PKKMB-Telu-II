import type { ResourceConfig } from "@/components/dashboard/content-manager";

const AUD: [string, string][] = [["ALL", "Semua"], ["MABA", "Maba"], ["MENTOR", "Mentor"], ["GROUP", "Gugus tertentu"], ["FACULTY", "Fakultas tertentu"]];

export const RESOURCES: ResourceConfig[] = [
  { resource: "announcements", title: "Pengumuman", columns: [["title", "Judul"], ["category", "Kategori"], ["audience", "Audiens"], ["published_at", "Terbit"]], fields: [
    { name: "title", label: "Judul", type: "text", required: true }, { name: "category", label: "Kategori", type: "text", required: true },
    { name: "body", label: "Isi", type: "textarea", required: true }, { name: "audience", label: "Audiens", type: "select", options: AUD, required: true },
    { name: "group_id", label: "ID gugus (jika audiens gugus)", type: "number" }, { name: "faculty_id", label: "ID fakultas (jika audiens fakultas)", type: "number" },
    { name: "published_at", label: "Waktu terbit", type: "datetime", hint: "Kosongkan untuk draf" }, { name: "is_pinned", label: "Sematkan", type: "checkbox" },
  ] },
  { resource: "materials", title: "Materi", columns: [["title", "Judul"], ["type", "Tipe"], ["order", "Urutan"]], fields: [
    { name: "title", label: "Judul", type: "text", required: true }, { name: "type", label: "Tipe", type: "select", options: [["PDF", "PDF"], ["VIDEO", "Video (embed URL)"], ["LINK", "Tautan"]], required: true },
    { name: "description", label: "Deskripsi", type: "textarea" }, { name: "url", label: "URL (https)", type: "url" }, { name: "order", label: "Urutan", type: "number" },
    { name: "session_id", label: "ID sesi (opsional)", type: "number" }, { name: "file", label: "File PDF (maks 20 MB)", type: "file", accept: "application/pdf" },
  ] },
  { resource: "assignments", title: "Tugas", columns: [["title", "Judul"], ["type", "Tipe"], ["due_at", "Tenggat"], ["is_required", "Wajib"]], fields: [
    { name: "title", label: "Judul", type: "text", required: true }, { name: "type", label: "Tipe", type: "select", options: [["FILE", "Unggah file"], ["LINK", "Tautan"], ["TEXT", "Teks"]], required: true },
    { name: "description", label: "Instruksi", type: "textarea", required: true }, { name: "due_at", label: "Tenggat", type: "datetime", required: true },
    { name: "max_score", label: "Nilai maks", type: "number" }, { name: "points", label: "Poin", type: "number" }, { name: "is_required", label: "Wajib (syarat sertifikat)", type: "checkbox" },
  ] },
  { resource: "faqs", title: "FAQ", columns: [["question", "Pertanyaan"], ["category", "Kategori"]], fields: [
    { name: "question", label: "Pertanyaan", type: "text", required: true }, { name: "category", label: "Kategori", type: "text", required: true },
    { name: "answer", label: "Jawaban", type: "textarea", required: true }, { name: "order", label: "Urutan", type: "number" },
  ] },
  { resource: "gallery", title: "Galeri", columns: [["title", "Judul"], ["taken_at", "Tanggal"]], fields: [
    { name: "title", label: "Judul", type: "text", required: true }, { name: "taken_at", label: "Tanggal", type: "date" },
    { name: "caption", label: "Keterangan / alt text", type: "textarea", hint: "Dipakai sebagai teks alternatif gambar (aksesibilitas)." },
    { name: "file", label: "Foto (JPG/PNG/WEBP, maks 8 MB)", type: "file", accept: "image/jpeg,image/png,image/webp" },
  ] },
  { resource: "faculties", title: "Fakultas", columns: [["code", "Kode"], ["name", "Nama"]], fields: [
    { name: "code", label: "Kode", type: "text", required: true }, { name: "name", label: "Nama", type: "text", required: true },
    { name: "name_en", label: "Nama (EN)", type: "text" }, { name: "description", label: "Deskripsi", type: "textarea" },
  ] },
  { resource: "organizations", title: "UKM", columns: [["name", "Nama"], ["category", "Kategori"], ["instagram", "Instagram"]], fields: [
    { name: "name", label: "Nama", type: "text", required: true }, { name: "category", label: "Kategori", type: "text", required: true },
    { name: "instagram", label: "Username Instagram", type: "text" }, { name: "description", label: "Deskripsi", type: "textarea", required: true },
  ] },
  { resource: "places", title: "Lokasi kampus", columns: [["name", "Nama"], ["category", "Kategori"]], fields: [
    { name: "name", label: "Nama", type: "text", required: true }, { name: "category", label: "Kategori", type: "text", required: true },
    { name: "latitude", label: "Latitude", type: "number", required: true }, { name: "longitude", label: "Longitude", type: "number", required: true },
    { name: "description", label: "Deskripsi", type: "textarea", required: true },
  ] },
  { resource: "badges", title: "Badge", columns: [["name", "Nama"], ["code", "Kode"], ["points", "Poin"]], fields: [
    { name: "code", label: "Kode (dipakai sistem)", type: "text", required: true }, { name: "name", label: "Nama", type: "text", required: true },
    { name: "icon", label: "Ikon (footprints/sunrise/map/zap/brain/flame)", type: "text", required: true }, { name: "points", label: "Poin", type: "number" },
    { name: "description", label: "Deskripsi", type: "textarea", required: true },
  ] },
  { resource: "missions", title: "Misi harian", columns: [["title", "Judul"], ["date", "Tanggal"], ["action", "Aksi"], ["points", "Poin"]], fields: [
    { name: "title", label: "Judul", type: "text", required: true }, { name: "date", label: "Tanggal", type: "date", required: true },
    { name: "action", label: "Aksi pemicu", type: "select", options: [["ATTEND", "Presensi"], ["SUBMIT", "Kumpul tugas"], ["QUIZ", "Lulus kuis"], ["READ_FAQ", "Buka FAQ"], ["VISIT_MAP", "Buka peta"]], required: true },
    { name: "points", label: "Poin", type: "number" }, { name: "description", label: "Deskripsi", type: "textarea", required: true },
  ] },
];

export const SESSION_RESOURCE: ResourceConfig = {
  resource: "sessions", title: "Sesi", columns: [["title", "Judul"], ["day_number", "Hari"], ["starts_at", "Mulai"], ["mode", "Mode"], ["attendance_open", "Presensi dibuka"]],
  fields: [
    { name: "title", label: "Judul", type: "text", required: true },
    { name: "type", label: "Tipe", type: "select", options: [["PRE", "Pre-PKKMB"], ["UNIVERSITAS", "Universitas"], ["FAKULTAS", "Fakultas"], ["PRODI", "Prodi"]], required: true },
    { name: "description", label: "Deskripsi", type: "textarea" },
    { name: "mode", label: "Mode", type: "select", options: [["OFFLINE", "Luring (QR)"], ["ONLINE", "Daring (kode)"]], required: true },
    { name: "day_number", label: "Hari ke-", type: "number", required: true },
    { name: "starts_at", label: "Mulai", type: "datetime", required: true }, { name: "ends_at", label: "Selesai", type: "datetime", required: true },
    { name: "batch", label: "Batch (kosong = semua)", type: "number" }, { name: "faculty_id", label: "ID fakultas (kosong = semua)", type: "number" },
    { name: "location", label: "Lokasi", type: "text" }, { name: "online_code", label: "Kode presensi daring", type: "text" },
    { name: "latitude", label: "Geofence latitude", type: "number" }, { name: "longitude", label: "Geofence longitude", type: "number" },
    { name: "radius_m", label: "Radius geofence (m)", type: "number", hint: "Kosongkan untuk menonaktifkan geofence." },
    { name: "points", label: "Poin", type: "number" }, { name: "is_mandatory", label: "Sesi wajib", type: "checkbox" }, { name: "attendance_open", label: "Presensi dibuka", type: "checkbox" },
  ],
};
