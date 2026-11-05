import type { Role } from "@/lib/types";

/** Menu dashboard per role. `key` = kunci terjemahan di messages/*.json (namespace dash). */
export type NavItem = { href: string; key: string; icon: string; roles?: Role[] };

export const MABA_NAV: NavItem[] = [
  { href: "/dashboard", key: "overview", icon: "LayoutDashboard" },
  { href: "/dashboard/jadwal", key: "schedule", icon: "CalendarDays" },
  { href: "/dashboard/presensi", key: "attendance", icon: "QrCode" },
  { href: "/dashboard/tugas", key: "assignments", icon: "ClipboardList" },
  { href: "/dashboard/materi", key: "materials", icon: "BookOpen" },
  { href: "/dashboard/gamifikasi", key: "gamification", icon: "Trophy" },
  { href: "/dashboard/kartu", key: "card", icon: "IdCard" },
  { href: "/dashboard/sertifikat", key: "certificate", icon: "Award" },
  { href: "/dashboard/asisten", key: "assistant", icon: "Bot" },
  { href: "/dashboard/bantuan", key: "help", icon: "LifeBuoy" },
];

export const MENTOR_NAV: NavItem[] = [
  { href: "/mentor", key: "group", icon: "Users" },
  { href: "/mentor/penilaian", key: "grading", icon: "ClipboardCheck" },
  { href: "/mentor/scanner", key: "scanner", icon: "ScanLine" },
  { href: "/mentor/pengumuman", key: "broadcast", icon: "Megaphone" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", key: "analytics", icon: "BarChart3" },
  { href: "/admin/sesi", key: "sessions", icon: "QrCode" },
  { href: "/admin/konten", key: "content", icon: "FileStack" },
  { href: "/admin/pengguna", key: "users", icon: "Users", roles: ["ADMIN"] },
  { href: "/admin/tiket", key: "tickets", icon: "LifeBuoy" },
  { href: "/admin/audit", key: "audit", icon: "ScrollText", roles: ["ADMIN"] },
  { href: "/admin/pengaturan", key: "settings", icon: "Settings", roles: ["ADMIN"] },
  { href: "/mentor", key: "group", icon: "Users" },
  { href: "/mentor/scanner", key: "scanner", icon: "ScanLine" },
];

/** Item di bottom-nav mobile (maks 5). */
export const MOBILE_KEYS = ["overview", "schedule", "attendance", "assignments", "help", "group", "grading", "scanner", "analytics", "sessions", "tickets"];
