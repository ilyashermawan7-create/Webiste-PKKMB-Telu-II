import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PKKMB Telkom University",
    short_name: "PKKMB Tel-U",
    description: "Dashboard Young TeluTizen: jadwal, presensi QR, tugas, dan sertifikat PKKMB.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#B6252A",
    lang: "id",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Presensi", url: "/dashboard/presensi" },
      { name: "Jadwal", url: "/dashboard/jadwal" },
    ],
  };
}
