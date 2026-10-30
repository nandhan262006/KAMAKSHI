import { makeOgCard } from "@/lib/og";

export const alt = "Kamakshi Cinema Photography — Wedding Photography & Cinematography";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return makeOgCard(
    "Every wedding, filmed like a movie.",
    "RAW photos · LOG & 10-bit video · true 4K · double backup",
  );
}
