import { makeOgCard } from "@/lib/og";

export const alt = "Gallery — Kamakshi Cinema Photography";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return makeOgCard(
    "The full gallery.",
    "Wedding & pre-wedding frames from recent events",
  );
}
