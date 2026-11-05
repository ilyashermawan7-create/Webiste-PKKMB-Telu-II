import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/tentang", "/jadwal", "/atribut", "/kampus", "/fakultas", "/ukm", "/pengumuman", "/galeri", "/faq", "/kontak"];
  return pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: new Date(), changeFrequency: p === "/pengumuman" || p === "/jadwal" ? "daily" : "weekly", priority: p === "" ? 1 : 0.7 }));
}
