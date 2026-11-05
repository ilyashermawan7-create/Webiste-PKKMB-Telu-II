# Aset logo PKKMB 2026 Telkom University

Sumber: `LOGO PKKMB POTRAIT.png` (2700×3375) dari panitia. Latar #FCFCFC dijadikan transparan
dan dipotong rapat; warna & bentuk logo tidak diubah.

| File | Kegunaan |
|---|---|
| `logo-pkkmb.png` / `.webp` | Logo potret lengkap (hero, login, sertifikat) |
| `logo-pkkmb-mark.png` / `@2x` | Emblem saja (navbar, sidebar, kartu digital) |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Ikon PWA (emblem di kotak putih) |
| `apple-icon.png`, `favicon.ico`, `favicon-48.png` | Ikon iOS & favicon |

Aturan pemakaian:
- Jangan mengubah proporsi, warna, menambah efek, atau merotasi logo.
- Di atas latar merah/gelap, logo selalu diletakkan pada badge putih (lihat komponen `<Logo onColor />`),
  karena unsur abu-abu logo tidak kontras di latar gelap.
- Untuk mengganti logo tahun berikutnya: timpa file dengan nama yang sama (proporsi bisa berbeda;
  sesuaikan `width`/`height` di `src/components/layout/logo.tsx`).
