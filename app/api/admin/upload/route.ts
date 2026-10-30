import { hasSession } from "@/lib/auth";
import {
  contentTypeFor,
  putObject,
  type MediaKind,
} from "@/lib/storage";
import sharp from "sharp";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

/** Longest edge for stored images — covers 4K+ displays; larger camera masters are downscaled. */
const MAX_EDGE = 2560;
/** Middle-of-the-road WebP quality: crisp for a photography site, still much smaller than camera JPGs. */
const WEBP_QUALITY = 80;

/** CRF 26 with `veryfast`: solid quality for web playback at a fraction of the source size. */
const VIDEO_CRF = 26;
const VIDEO_CAP = 1920;
/** Verified filter: downscale to fit 1920 when above it, never upscale smaller clips. */
const VIDEO_SCALE_FILTER =
  "scale=w='trunc(iw*(min(min(1920/iw\\,1920/ih)\\,1)/2))*2':h='trunc(ih*(min(min(1920/iw\\,1920/ih)\\,1)/2))*2'";

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

export const maxDuration = 300;

/** Transcodes footage to H.264 MP4 capped at 1080, never above the source size. Returns null to keep the original. */
async function compressVideo(body: Buffer): Promise<Buffer | null> {
  const ffmpegBinary: string | null = ffmpegPath;
  if (!ffmpegBinary) return null;
  const dir = await mkdtemp(join(tmpdir(), "upload-"));
  const inputPath = join(dir, "input");
  const outputPath = join(dir, "output.mp4");
  try {
    await writeFile(inputPath, body);
    await new Promise<void>((resolve, reject) => {
      const ff = spawn(
        ffmpegBinary,
        [
          "-y",
          "-i", inputPath,
          "-c:v", "libx264",
          "-crf", String(VIDEO_CRF),
          "-preset", "veryfast",
          "-vf", VIDEO_SCALE_FILTER,
          "-c:a", "aac",
          "-b:a", "128k",
          "-movflags", "+faststart",
          "-f", "mp4",
          outputPath,
        ],
        { stdio: ["ignore", "ignore", "ignore"] as const },
      );
      ff.on("error", () => reject(new Error("ffmpeg failed")));
      ff.on("close", (code: number | null) =>
        code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)),
      );
    });
    const buffer = await readFile(outputPath);
    if (buffer.byteLength === 0 || buffer.byteLength >= body.byteLength) {
      return null;
    }
    return buffer;
  } catch (error) {
    console.error("video compression failed, storing original", error);
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true });
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
        : await (async () => {
            const codec = await compressVideo(Buffer.from(body));
            if (!codec) {
              return putObject("videos", filename, Buffer.from(body), contentType);
            }
            const storedName = filename.replace(/\.[a-z0-9]+$/i, ".mp4");
            return putObject("videos", storedName, codec, "video/mp4");
          })();
    return Response.json({ src });
  } catch (error) {
    console.error("upload failed", error);
    return Response.json({ error: "Storage upload failed" }, { status: 502 });
  }
}
