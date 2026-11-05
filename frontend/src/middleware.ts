import { NextResponse, type NextRequest } from "next/server";
import { HOME_BY_ROLE, ROLE_COOKIE, TOKEN_COOKIE } from "@/lib/config";
import { verifyValue } from "@/lib/signed-cookie";
import type { Role } from "@/lib/types";

/** Guard halaman per role (lapisan UX). Otorisasi data tetap ditegakkan oleh Laravel. */
const RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard", roles: ["MABA"] },
  { prefix: "/mentor", roles: ["MENTOR", "PANITIA", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN", "PANITIA"] },
];


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const role = (await verifyValue(req.cookies.get(ROLE_COOKIE)?.value)) as Role | null;

  if (pathname === "/login" && token && role) {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[role], req.url));
  }

  const rule = RULES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (!rule) return NextResponse.next();

  if (!token || !role) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!rule.roles.includes(role)) {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[role], req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/login", "/dashboard/:path*", "/mentor/:path*", "/admin/:path*"] };
