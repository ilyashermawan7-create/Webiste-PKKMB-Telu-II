import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { API_URL, HOME_BY_ROLE, HOME_COOKIE, ROLE_COOKIE, TOKEN_COOKIE } from "@/lib/config";
import type { Role } from "@/lib/types";
import { signValue } from "@/lib/signed-cookie";

const schema = z.object({
  nim: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(128),
  remember: z.boolean().optional(),
});

/** BFF login: teruskan kredensial ke Laravel, simpan token di cookie httpOnly. */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: "NIM/email dan kata sandi wajib diisi." }, { status: 422 });
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Teruskan IP klien agar rate limit Laravel per-IP tetap akurat
      "X-Forwarded-For": req.headers.get("x-forwarded-for") ?? "",
      "User-Agent": req.headers.get("user-agent") ?? "pkkmb-web",
    },
    body: JSON.stringify({ login: parsed.data.nim, password: parsed.data.password, device: "web" }),
  }).catch(() => null);

  if (!res) return NextResponse.json({ message: "Server sedang tidak dapat dijangkau." }, { status: 503 });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ message: body.message ?? "Login gagal." }, { status: res.status });

  const maxAge = parsed.data.remember ? 60 * 60 * 24 * 14 : 60 * 60 * 12;
  // Secure bila diakses via HTTPS (langsung atau di belakang reverse proxy)
  const secure = (req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "")) === "https";
  const out = NextResponse.json({ user: body.user });
  out.cookies.set(TOKEN_COOKIE, body.token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge });
  out.cookies.set(ROLE_COOKIE, await signValue(body.user.role), { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge });
  // Cookie non-sensitif (bisa dibaca JS) agar navbar halaman publik statis tahu tujuan tombol Dashboard
  out.cookies.set(HOME_COOKIE, HOME_BY_ROLE[body.user.role as Role] ?? "/dashboard", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge });
  return out;
}
