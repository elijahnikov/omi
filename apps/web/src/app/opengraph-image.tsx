import { ImageResponse } from "next/og";
import { site } from "~/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        backgroundImage:
          "radial-gradient(60% 50% at 50% 0%, rgba(59,130,246,0.10), transparent 70%)",
        padding: "80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: "#18181b" }}>
          omi
        </span>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            backgroundColor: "#3b82f6",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#18181b",
            lineHeight: 1.05,
            maxWidth: "900px",
          }}
        >
          The knowledge base that thinks with you.
        </div>
        <div style={{ fontSize: 30, color: "#52525b", maxWidth: "820px" }}>
          Capture anything. Find it by meaning. Let your AI act on it.
        </div>
      </div>
    </div>,
    size
  );
}
