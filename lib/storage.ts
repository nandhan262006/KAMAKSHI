import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "node:crypto";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export type MediaKind = "image" | "video";

export function extFromFilename(filename: string): string | null {
  const match = /\.([a-z0-9]+)$/i.exec(filename.trim());
  return match ? match[1].toLowerCase() : null;
}

/** Returns content type when the filename maps to a whitelisted image/video type. */
export function contentTypeFor(
  filename: string,
  kind?: MediaKind,
): string | null {
  const ext = extFromFilename(filename);
  if (!ext) return null;
  const type = CONTENT_TYPES[ext];
  if (!type) return null;
  if (kind === "image" && !type.startsWith("image/")) return null;
  if (kind === "video" && !type.startsWith("video/")) return null;
  return type;
}

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
  // Required for presigned browser uploads: SDK v3's default CRC32 checksum
  // middleware signs a value the browser cannot send, causing SignatureDoesNotMatch.
  requestChecksumCalculation: "WHEN_REQUIRED",
});

export function remoteFromSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

export function newKey(folder: string, filename: string): string {
  const ext = extFromFilename(filename) ?? "bin";
  const hash = randomBytes(8).toString("hex");
  return `${folder}/${Date.now()}-${hash}.${ext}`;
}

export function publicUrlFor(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${key}`;
}

export async function putObject(
  folder: string,
  filename: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET is not set");
  const key = newKey(folder, filename);
  await s3.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
  );
  return publicUrlFor(key);
}

/**
 * Presigned direct-to-R2 upload for video. The browser PUTs the file itself,
 * which bypasses the ~4.5MB serverless request-body limit that breaks 100MB+ uploads.
 */
export async function presignVideoUpload(
  filename: string,
): Promise<{ uploadUrl: string; src: string; contentType: string }> {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET is not set");
  const contentType = contentTypeFor(filename, "video");
  if (!contentType) throw new Error("Unsupported video file");
  const key = newKey("videos", filename);
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 3600 },
  );
  return { uploadUrl, src: publicUrlFor(key), contentType };
}

/** Deletes the R2 object behind a stored URL; ignores local paths like /downloads/… */
export async function deleteObjectFor(src: string): Promise<void> {
  if (!remoteFromSrc(src)) return;
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  if (!base || !src.startsWith(`${base}/`)) return;
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET is not set");
  const key = src.slice(base.length + 1);
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
