import { ImageResponse } from "next/og";

export const alt = "PKKMB Telkom University";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "white", background: "linear-gradient(135deg,#ED1E28 0%,#B6252A 60%,#6E1418 100%)" }}>
        <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.85 }}>TELKOM UNIVERSITY</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>PKKMB</div>
          <div style={{ fontSize: 44, marginTop: 16 }}>Welcome, Young TeluTizen!</div>
        </div>
        <div style={{ fontSize: 28, opacity: 0.85 }}>Creating the Future</div>
      </div>
    ),
    size,
  );
}
