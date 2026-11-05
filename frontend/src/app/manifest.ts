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
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    shortcuts: [
      { name: "Presensi", url: "/dashboard/presensi" },
      { name: "Jadwal", url: "/dashboard/jadwal" },
    ],
  };
}
