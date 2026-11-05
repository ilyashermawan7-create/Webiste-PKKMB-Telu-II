import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "PKKMB Telkom University";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/brand/logo-pkkmb.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 72, color: "white", background: "linear-gradient(135deg,#ED1E28 0%,#B6252A 60%,#6E1418 100%)" }}>
        <div style={{ display: "flex", background: "white", borderRadius: 40, padding: 28 }}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- ImageResponse */}
          <img src={logo} height={420} width={288} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.85 }}>TELKOM UNIVERSITY</div>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1, marginTop: 16 }}>PKKMB 2026</div>
          <div style={{ fontSize: 44, marginTop: 20 }}>Welcome, Young TeluTizen!</div>
          <div style={{ fontSize: 28, opacity: 0.85, marginTop: 36 }}>Creating the Future</div>
        </div>
      </div>
    ),
    size,
  );
}
