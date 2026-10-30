import { hasSession } from "@/lib/auth";
import {
  contentTypeFor,
  putObject,
  type MediaKind,
} from "@/lib/storage";

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
    const src = await putObject(
      kind === "video" ? "videos" : "images",
      filename,
      Buffer.from(body),
      contentType,
    );
    return Response.json({ src });
  } catch (error) {
    console.error("upload failed", error);
    return Response.json({ error: "Storage upload failed" }, { status: 502 });
  }
}
