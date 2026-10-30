"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  addGalleryItems,
  createFilm,
  replaceFilmVideo,
  setFilmPoster,
  replaceGalleryImage,
} from "@/app/admin/actions";

type Kind = "image" | "video";

/** XHR upload to /api/admin/upload so we get real progress events. */
function uploadFile(
  file: File,
  kind: Kind,
  onProgress: (value: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `/api/admin/upload?kind=${kind}&filename=${encodeURIComponent(file.name)}`,
    );
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          resolve(JSON.parse(xhr.responseText).src);
        } catch {
          reject(new Error("Unexpected server response"));
        }
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error ?? `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

/**
 * Video upload goes straight to R2 with a presigned URL (server request bodies
 * cap at ~4.5MB on Vercel), then a finalize pass transcodes to 1080p MP4.
 */
async function uploadVideo(
  file: File,
  onProgress: (value: number) => void,
): Promise<string> {
  const presignRes = await fetch("/api/admin/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name }),
  });
  if (!presignRes.ok) {
    let message = `Could not start upload (${presignRes.status})`;
    try {
      message = (await presignRes.json()).error ?? message;
    } catch {}
    throw new Error(message);
  }
  const { uploadUrl, src, contentType } = await presignRes.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });

  let finalSrc = src as string;
  try {
    const finalizeRes = await fetch("/api/admin/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src }),
    });
    if (finalizeRes.ok) {
      const data = await finalizeRes.json();
      if (typeof data.src === "string") finalSrc = data.src;
    }
  } catch {
    // Upload itself already succeeded; keep the stored original.
  }
  return finalSrc;
}

type UploadState = {
  label: string;
  value: number; // 0..1
} | null;

function ProgressBar({ upload }: { upload: NonNullable<UploadState> }) {
  const pct = Math.min(100, Math.round(upload.value * 100));
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-[#FAF9F6] px-4 py-3"
      aria-live="polite"
      role="status"
    >
      <div className="flex items-baseline justify-between gap-3 text-xs font-medium">
        <span className="truncate text-stone-600">{upload.label}</span>
        <span className="tabular-nums text-stone-400">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-stone-900 transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ErrorNote({ error }: { error: string | null }) {
  return error ? (
    <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
      {error}
    </p>
  ) : null;
}

const inputClass =
  "rounded-xl border border-stone-300 bg-[#FAF9F6] px-4 py-3 text-sm outline-none focus:border-stone-900 focus:bg-white";
const fileClass =
  "rounded-xl border border-stone-300 bg-[#FAF9F6] px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.1em] file:text-white";
const submitClass =
  "rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-stone-900";

/* -------------------------- new film (films page) ------------------------- */

export function FilmCreateForm() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [video, setVideo] = React.useState<File | null>(null);
  const [poster, setPoster] = React.useState<File | null>(null);
  const [pending, setPending] = React.useState(false);
  const [upload, setUpload] = React.useState<UploadState>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const setProgress = (label: string, file: File, value: number) =>
    setUpload({ label: `Uploading ${label} — ${file.name}`, value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!video || pending) return;
    setPending(true);
    setError(null);
    setDone(false);
    try {
      const src = await uploadVideo(video, (v) =>
        setProgress("video", video, v),
      );
      let posterUrl: string | null = null;
      if (poster) {
        posterUrl = await uploadFile(poster, "image", (v) =>
          setProgress("poster", poster, v),
        );
      }
      setUpload({ label: "Saving film…", value: 1 });
      await createFilm({
        src,
        poster: posterUrl,
        title,
        description,
      });
      setUpload(null);
      setDone(true);
      setVideo(null);
      setPoster(null);
      setTitle("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setUpload(null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 px-6 pb-8 sm:px-8"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Video file (mp4 · webm · mov)
        </span>
        <input
          type="file"
          accept="video/*"
          required
          disabled={pending}
          onChange={(e) => {
            setVideo(e.target.files?.[0] ?? null);
            setDone(false);
          }}
          className={`${fileClass} w-full`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Raviteja weds Ananya"
            disabled={pending}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Poster image (optional)
          </span>
          <input
            type="file"
            accept="image/*"
            disabled={pending}
            onChange={(e) => setPoster(e.target.files?.[0] ?? null)}
            className={`${fileClass} sm:w-fit file:bg-stone-200 file:text-stone-800`}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Description / couple note
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A small write-up the site shows under the film."
          disabled={pending}
          className={inputClass}
        />
      </label>

      {upload ? <ProgressBar upload={upload} /> : null}
      <ErrorNote error={error} />

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <p className="text-xs text-stone-400" aria-hidden>
          {pending
            ? "Sending to the storage engine…"
            : done
              ? "Film added."
              : "Uploads go straight to the R2 storage engine."}
        </p>
        <button type="submit" disabled={pending || !video} className={submitClass}>
          {pending ? "Uploading…" : "Save film"}
        </button>
      </div>
    </form>
  );
}

/* ----------------------------- film edit page ----------------------------- */

export function FilmVideoReplaceForm({ filmId }: { filmId: number }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [upload, setUpload] = React.useState<UploadState>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || pending) return;
    setPending(true);
    setError(null);
    try {
      const src = await uploadVideo(file, (v) =>
        setUpload({ label: `Uploading — ${file.name}`, value: v }),
      );
      setUpload({ label: "Replacing film…", value: 1 });
      await replaceFilmVideo(filmId, src);
      setUpload(null);
      router.refresh();
    } catch (err) {
      setUpload(null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        disabled={pending}
        onChange={handleChange}
        className={`${fileClass} w-full`}
      />
      {upload ? <ProgressBar upload={upload} /> : null}
      <ErrorNote error={error} />
    </div>
  );
}

export function FilmPosterReplaceForm({ filmId }: { filmId: number }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [upload, setUpload] = React.useState<UploadState>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || pending) return;
    setPending(true);
    setError(null);
    try {
      const src = await uploadFile(file, "image", (v) =>
        setUpload({ label: `Uploading — ${file.name}`, value: v }),
      );
      setUpload({ label: "Saving poster…", value: 1 });
      await setFilmPoster(filmId, src);
      setUpload(null);
      router.refresh();
    } catch (err) {
      setUpload(null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={pending}
        onChange={handleChange}
        className={`${fileClass} w-full sm:w-fit file:bg-stone-200 file:text-stone-800`}
      />
      {upload ? <ProgressBar upload={upload} /> : null}
      <ErrorNote error={error} />
    </div>
  );
}

/* ------------------------------- gallery page ------------------------------ */

export function GalleryUploadForm() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [upload, setUpload] = React.useState<UploadState>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [doneCount, setDoneCount] = React.useState(0);

  function pickFiles(list: FileList | null) {
    const picked = list ? Array.from(list) : [];
    setFiles(picked);
    setError(null);
    setDoneCount(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0 || pending) return;
    setPending(true);
    setError(null);
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    const srcs: string[] = [];
    const bytesBefore = (index: number) =>
      files.slice(0, index).reduce((sum, f) => sum + f.size, 0);
    const total = Math.max(totalBytes, 1);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const src = await uploadFile(file, "image", (v) => {
          setUpload({
            label: `Uploading ${i + 1}/${files.length} — ${file.name}`,
            value: (bytesBefore(i) + file.size * v) / total,
          });
        });
        srcs.push(src);
      }
      setUpload({ label: "Adding frames…", value: 1 });
      await addGalleryItems(srcs);
      setDoneCount(srcs.length);
      setUpload(null);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setUpload(null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pb-8 sm:px-8">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragOver
            ? "border-stone-900 bg-stone-100"
            : "border-stone-300 bg-[#FAF9F6] hover:border-stone-500 hover:bg-stone-50"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200/70">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 16V4m0 0 3.5 3.5M12 4 8.5 7.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          </svg>
        </span>
        <span className="text-sm font-medium">
          {files.length > 0
            ? `${files.length} file${files.length === 1 ? "" : "s"} ready to upload`
            : "Select frames (multiple at once), or drop them here"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={pending}
          onChange={(e) => pickFiles(e.target.files)}
          className="sr-only"
        />
      </label>

      {upload ? <ProgressBar upload={upload} /> : null}
      <ErrorNote error={error} />

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <p className="text-xs text-stone-400" aria-hidden>
          {pending
            ? "Sending to the storage engine…"
            : doneCount > 0
              ? `${doneCount} frame${doneCount === 1 ? "" : "s"} added.`
              : "JPG · PNG · WebP camera masters straight to R2."}
        </p>
        <button type="submit" disabled={pending || files.length === 0} className={submitClass}>
          {pending ? "Uploading…" : `Upload ${files.length > 0 ? `(${files.length})` : "frames"}`}
        </button>
      </div>
    </form>
  );
}

export function GalleryReplaceForm({ id }: { id: number }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [upload, setUpload] = React.useState<UploadState>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || pending) return;
    setPending(true);
    setError(null);
    try {
      const src = await uploadFile(file, "image", (v) =>
        setUpload({ label: `Uploading — ${file.name}`, value: v }),
      );
      setUpload({ label: "Replacing image…", value: 1 });
      await replaceGalleryImage(id, src);
      setUpload(null);
      router.refresh();
    } catch (err) {
      setUpload(null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={pending}
        onChange={handleChange}
        className="w-full cursor-pointer rounded-lg border border-stone-300 bg-[#FAF9F6] px-3 py-2 text-xs file:mr-2 file:rounded file:border-0 file:bg-stone-900 file:px-3 file:py-1 file:text-[10px] file:font-semibold file:uppercase file:text-white"
      />
      {upload ? <ProgressBar upload={upload} /> : null}
      <ErrorNote error={error} />
    </div>
  );
}
