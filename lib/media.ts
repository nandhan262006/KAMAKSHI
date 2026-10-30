import sharp from "sharp";
import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

/** Longest edge for stored images — covers 4K+ displays; larger camera masters are downscaled. */
const MAX_EDGE = 2560;
/** Middle-of-the-road WebP quality: crisp for a photography site, still much smaller than camera JPGs. */
const WEBP_QUALITY = 80;

/** CRF 26 with `veryfast`: solid quality for web playback at a fraction of the source size. */
const VIDEO_CRF = 26;
/** Verified filter: downscale to fit 1920 when above it, never upscale smaller clips. */
const VIDEO_SCALE_FILTER =
  "scale=w='trunc(iw*(min(min(1920/iw\\,1920/ih)\\,1)/2))*2':h='trunc(ih*(min(min(1920/iw\\,1920/ih)\\,1)/2))*2'";

/** Auto-orient, cap size and compress to WebP. Falls back to the original if processing fails. */
export async function compressImage(
  body: Buffer,
  filename: string,
): Promise<{ buffer: Buffer; filename: string }> {
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

/**
 * Transcodes a video file on disk to H.264 MP4 capped at 1080, never above the source size.
 * Returns null when the server should keep the original (ffmpeg missing, failure, no gain).
 */
export async function compressVideoFile(
  inputPath: string,
  originalSize: number,
): Promise<Buffer | null> {
  const ffmpegBinary: string | null = ffmpegPath;
  if (!ffmpegBinary) return null;
  const outputPath = join(inputPath, "..", "output.mp4");
  try {
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
    if (buffer.byteLength === 0 || buffer.byteLength >= originalSize) {
      return null;
    }
    return buffer;
  } catch (error) {
    console.error("video compression failed, keeping original", error);
    return null;
  } finally {
    await rm(outputPath, { force: true });
  }
}
