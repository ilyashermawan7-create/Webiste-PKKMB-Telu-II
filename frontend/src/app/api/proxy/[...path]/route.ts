import { NextResponse, type NextRequest } from "next/server";
import { API_URL, TOKEN_COOKIE } from "@/lib/config";

/**
 * BFF proxy: meneruskan request client → Laravel dengan Bearer token dari cookie httpOnly.
 * - Proteksi CSRF: request yang mengubah data wajib berasal dari origin yang sama.
 * - Body di-stream apa adanya (mendukung multipart upload & SSE).
 */
export const dynamic = "force-dynamic";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  if (!SAFE.has(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (!origin || new URL(origin).host !== host) {
      return NextResponse.json({ message: "Origin tidak valid." }, { status: 403 });
    }
  }

  const { path } = await ctx.params;
  // Cegah path traversal ke luar prefix API
  if (path.some((p) => p === ".." || p.includes("\\"))) {
    return NextResponse.json({ message: "Path tidak valid." }, { status: 400 });
  }
  const target = `${API_URL}/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  const headers = new Headers({ Accept: req.headers.get("accept") ?? "application/json" });
  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-Forwarded-For", req.headers.get("x-forwarded-for") ?? "");

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: SAFE.has(req.method) ? undefined : req.body,
    // @ts-expect-error — diperlukan Node fetch untuk streaming request body
    duplex: "half",
    cache: "no-store",
  }).catch(() => null);

  if (!upstream) return NextResponse.json({ message: "Server API tidak dapat dijangkau." }, { status: 503 });

  const resHeaders = new Headers();
  for (const h of ["content-type", "content-disposition", "cache-control", "retry-after"]) {
    const v = upstream.headers.get(h);
    if (v) resHeaders.set(h, v);
  }
  if (upstream.headers.get("content-type")?.includes("text/event-stream")) {
    resHeaders.set("Cache-Control", "no-cache, no-transform");
    resHeaders.set("X-Accel-Buffering", "no");
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: resHeaders });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
