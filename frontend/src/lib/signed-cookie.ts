/**
 * Tanda tangan HMAC untuk cookie role, dipakai middleware (Edge runtime) agar role
 * tidak bisa dipalsukan dari devtools. Otorisasi sebenarnya tetap di Laravel.
 */
const enc = new TextEncoder();

function b64url(buf: ArrayBuffer) {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function key() {
  const secret = process.env.SESSION_SECRET ?? "dev-only-secret-ganti-di-produksi";
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export async function signValue(value: string) {
  const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(value));
  return `${value}.${b64url(sig)}`;
}

/** Mengembalikan nilai asli bila tanda tangan valid, selain itu null. */
export async function verifyValue(signed: string | undefined | null) {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx < 1) return null;
  const value = signed.slice(0, idx);
  const expected = await signValue(value);
  // Perbandingan panjang-tetap sederhana
  if (expected.length !== signed.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signed.charCodeAt(i);
  return diff === 0 ? value : null;
}
