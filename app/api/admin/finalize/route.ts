import { hasSession } from "@/lib/auth";
import {
  contentTypeFor,
  deleteObjectFor,
  putObject,
  remoteFromSrc,
} from "@/lib/storage";
import { compressVideoFile } from "@/lib/media";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export const maxDuration = 780;

/** Protects the serverless /tmp disk — very long films keep their uploaded original. */
const MAX_FINALIZE_BYTES = 512 * 1024 * 1024;

/** Post-processing for direct-to-R2 video uploads: download, transcode to 1080p MP4, swap the key. */
export async function POST(request: Request) {
  if (!(await hasSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = (await request.json().catch(() => null)) as {
    src?: string;
  } | null;
  const src = input?.src ?? "";
  if (!src) {
    return Response.json({ error: "src is required" }, { status: 400 });
  }
  if (!remoteFromSrc(src)) {
    return Response.json({ src });
  }

  const originalName = basename(new URL(src).pathname);
  if (!contentTypeFor(originalName, "video")) {
    return Response.json({ src });
  }

  let dir: string | null = null;
  try {
    const head = await fetch(src, { method: "HEAD" });
    if (!head.ok) {
      return Response.json({ src });
    }
    const size = Number(head.headers.get("content-length") ?? "0");
    if (size === 0 || size > MAX_FINALIZE_BYTES) {
      return Response.json({ src });
    }

    dir = await mkdtemp(join(tmpdir(), "finalize-"));
    const inputPath = join(dir, "input");
    const res = await fetch(src, { method: "GET" });
    if (!res.ok || !res.body) {
      return Response.json({ src });
    }
    await pipeline(
      Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]),
      createWriteStream(inputPath),
    );

    const compressed = await compressVideoFile(inputPath, size);
    if (!compressed) {
      return Response.json({ src });
    }

    const finalName = originalName.replace(/\.[a-z0-9]+$/i, ".mp4");
    const finalSrc = await putObject("videos", finalName, compressed, "video/mp4");
    await deleteObjectFor(src);
    return Response.json({ src: finalSrc });
  } catch (error) {
    console.error("video finalize failed, keeping original", error);
    return Response.json({ src });
  } finally {
    if (dir) {
      await rm(dir, { recursive: true, force: true });
    }
  }
}
