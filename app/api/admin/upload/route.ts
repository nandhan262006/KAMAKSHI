import { hasSession } from "@/lib/auth";
import {
  contentTypeFor,
  putObject,
  type MediaKind,
} from "@/lib/storage";
import sharp from "sharp";

/** Longest edge for stored images — covers 4K+ displays; larger camera masters are downscaled. */
const MAX_EDGE = 2560;
/** Middle-of-the-road WebP quality: crisp for a photography site, still much smaller than camera JPGs. */
const WEBP_QUALITY = 80;

/** Auto-orient, cap size and compress to WebP. Falls back to the original if processing fails. */
async function compressImage(body: Buffer, filename: string): Promise<{ buffer: Buffer; filename: string }> {
  try {
    const buffer = await sharp(body)
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    const filenameWithoutExt = filename.replace(/\.[a-z0-9]+$/i, "");
    return { buffer, filename: `${filenameWithoutExt}.webp` };
  } catch (error) {
    console.error("image compression failed, storing original", error);
    return { buffer: body, filename };
  }
}

export async function POST(request: Request) {
  if (!(await hasSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filename = url.searchParams.get("filename") ?? "";
  const kindParam = url.searchParams.get("kind");
  const kind: MediaKind = kindParam === "video" ? "video" : "image";

  const contentType = contentTypeFor(filename, kind);
  if (!contentType) {
    return Response.json(
      { error: kind === "video" ? "Unsupported video file" : "Unsupported image file" },
      { status: 400 },
    );
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return Response.json({ error: "Empty file" }, { status: 400 });
  }

  try {
    const src =
      kind === "image"
        ? await (async () => {
            if (contentType === "image/gif") {
              return putObject("images", filename, Buffer.from(body), contentType);
            }
            const { buffer, filename: storedName } = await compressImage(
              Buffer.from(body),
              filename,
            );
            return putObject("images", storedName, buffer, "image/webp");
          })()
        : await putObject("videos", filename, Buffer.from(body), contentType);
    return Response.json({ src });
  } catch (error) {
    console.error("upload failed", error);
    return Response.json({ error: "Storage upload failed" }, { status: 502 });
  }
}
