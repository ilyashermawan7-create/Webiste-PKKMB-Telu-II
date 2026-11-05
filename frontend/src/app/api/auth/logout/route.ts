import { NextResponse, type NextRequest } from "next/server";
import { API_URL, HOME_COOKIE, ROLE_COOKIE, TOKEN_COOKIE } from "@/lib/config";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }
  const out = NextResponse.json({ ok: true });
  out.cookies.delete(TOKEN_COOKIE);
  out.cookies.delete(ROLE_COOKIE);
  out.cookies.delete(HOME_COOKIE);
  return out;
}
