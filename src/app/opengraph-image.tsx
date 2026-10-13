import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";

export const alt = `${siteConfig.name} — ${siteConfig.artistName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px",
          background:
            "linear-gradient(145deg, #eef2f5 0%, #d7dee4 48%, #c5d0d8 100%)",
          color: "#14202a",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.7) 0%, transparent 42%), radial-gradient(circle at 82% 18%, rgba(20,32,42,0.08) 0%, transparent 36%)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#5b6b78",
            marginBottom: 18,
          }}
        >
          {siteConfig.artistName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            lineHeight: 0.95,
            fontWeight: 700,
            maxWidth: 980,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "#3d4d5a",
            maxWidth: 860,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
