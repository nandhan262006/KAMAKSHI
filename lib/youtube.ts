const ID_RE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Docs note: the ID shape below is the official one — see youtube docs.
 */
function fromUrlCandidate(input: string): string | null {
  const hashed = [...input.matchAll(/[?&]v=([A-Za-z0-9_-]{11})(?=$|&|\/)/g)]
    .map((m) => m[1])
    .filter(Boolean);
  if (hashed.length > 0) return hashed[0] ?? null;
  const ids = [
    ...input.matchAll(
      /(?:youtu\.be|youtube\.com\/(?:embed|shorts|v)|youtube\.com\/live)\/([A-Za-z0-9_-]{11})(?=$|[?&#/])/g,
    ),
  ]
    .map((m) => m[1])
    .filter(Boolean);
  if (ids.length > 0) return ids[0] ?? null;
  return null;
}

/**
 * Accepts full YouTube URLs (watch / youtu.be / shorts / embed), or a bare
 * 11-character video ID. Returns the normalized watch URL, or null.
 */
export function normalizeYouTubeUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  let candidate: string;
  if (ID_RE.test(value)) {
    candidate = `https://www.youtube.com/watch?v=${value}`;
  } else {
    const parsed = (() => {
      try {
        return new URL(value.startsWith("http") ? value : `https://${value}`);
      } catch {
        return null;
      }
    })();
    if (!parsed) return null;
    const host = parsed.hostname.replace(/^www\.|^m\./, "");
    const allowed =
      host === "youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com";
    if (!allowed) return null;
    candidate = parsed.toString();
  }
  const id = fromUrlCandidate(candidate);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Extracts the raw video ID from a stored youtube link (already normalized). */
export function youtubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = /[?&]v=([A-Za-z0-9_-]{11})/.exec(url);
  return match?.[1] ?? null;
}
