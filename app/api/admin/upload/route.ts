import { hasSession } from "@/lib/auth";
import {
  contentTypeFor,
  putObject,
  type MediaKind,
} from "@/lib/storage";
import { compressImage } from "@/lib/media";

export const maxDuration = 300;

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

  if (kind === "video") {
    return Response.json(
      {
        error:
          "Videos upload directly to storage. Use the presigned upload flow instead of posting the body here.",
      },
      { status: 400 },
    );
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return Response.json({ error: "Empty file" }, { status: 400 });
  }

  try {
    const src =
      contentType === "image/gif"
        ? await putObject("images", filename, Buffer.from(body), contentType)
        : await (async () => {
            const { buffer, filename: storedName } = await compressImage(
              Buffer.from(body),
              filename,
            );
            return putObject("images", storedName, buffer, "image/webp");
          })();
    return Response.json({ src });
  } catch (error) {
    console.error("upload failed", error);
    return Response.json({ error: "Storage upload failed" }, { status: 502 });
  }
}
