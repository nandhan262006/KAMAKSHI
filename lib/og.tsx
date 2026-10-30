import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

const CREAM = "#faf9f6";
const INK = "#141414";
const MUTED = "#78716c";
const PINK = "#ec1e8c";

let logoDataUrl: string | null = null;

async function getLogoDataUrl(): Promise<string | null> {
  try {
    const buffer = await readFile(
      path.join(process.cwd(), "public", "justlogo.png"),
    );
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Shared 1200×630 social-card factory for every public route. */
export async function makeOgCard(
  title: string,
  subtitle = "Wedding Photography & Cinematography",
): Promise<ImageResponse> {
  logoDataUrl = logoDataUrl ?? (await getLogoDataUrl());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 8,
            background: PINK,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              width={88}
              height={82}
              style={{ borderRadius: 16, objectFit: "contain" }}
            />
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Kamakshi Cinema Photography
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.1,
              color: INK,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: MUTED,
              marginTop: 6,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              background: PINK,
              color: "#ffffff",
              padding: "12px 30px",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            Book your date
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: MUTED,
            }}
          >
            kamakshicinemaphotography.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
