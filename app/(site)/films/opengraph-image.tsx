import { makeOgCard } from "@/lib/og";

export const alt = "Wedding films by Kamakshi Cinema Photography";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return makeOgCard(
    "The wedding films.",
    "Shot, edited and graded in-house — recent work",
  );
}
