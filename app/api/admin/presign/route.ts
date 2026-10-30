import { hasSession } from "@/lib/auth";
import { presignVideoUpload } from "@/lib/storage";

/** Returns a one-hour presigned PUT URL so the browser can upload videos straight to R2. */
export async function POST(request: Request) {
  if (!(await hasSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    filename?: string;
  } | null;
  const filename = body?.filename ?? "";
  if (!filename) {
    return Response.json({ error: "filename is required" }, { status: 400 });
  }

  try {
    const presigned = await presignVideoUpload(filename);
    return Response.json({
      uploadUrl: presigned.uploadUrl,
      src: presigned.src,
      contentType: presigned.contentType,
    });
  } catch (error) {
    console.error("presign failed", error);
    return Response.json(
      { error: "Could not start the video upload" },
      { status: 502 },
    );
  }
}
