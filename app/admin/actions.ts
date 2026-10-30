"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { getDb, getFilm, withRetry } from "@/lib/db";
import { hasSession } from "@/lib/auth";
import { deleteObjectFor } from "@/lib/storage";
import { normalizeYouTubeUrl } from "@/lib/youtube";

async function assertAdmin() {
  if (!(await hasSession())) {
    throw new Error("Unauthorized");
  }
}

function revalidate() {
  revalidateTag("content", { expire: 0 });
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string): number {
  return Number(formData.get(key));
}

/** Ensures a media URL came from our own upload route (not arbitrary web URLs). */
function requireUploaded(
  src: string,
  kind: "images" | "videos",
): string {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  if (!base || !src.startsWith(`${base}/${kind}/`)) {
    throw new Error("File was not uploaded through the CMS.");
  }
  return src;
}

/* ---------------------------------- films --------------------------------- */

export type FilmInput = {
  src: string;
  poster?: string | null;
  title: string;
  description: string;
  youtube?: string | null;
};

/** Empty string clears; a value must parse as a YouTube link. Returns null or a normalized URL. */
function youtubeOrNull(input: string | null | undefined): string | null {
  const value = String(input ?? "").trim();
  if (!value) return null;
  const normalized = normalizeYouTubeUrl(value);
  if (!normalized) {
    throw new Error("That doesn't look like a YouTube link. Use a youtu.be/watch/shorts URL or a video ID.");
  }
  return normalized;
}

export async function createFilm(input: FilmInput) {
  await assertAdmin();
  const src = requireUploaded(input.src, "videos");
  const poster = input.poster
    ? requireUploaded(input.poster, "images")
    : null;
  const youtube = youtubeOrNull(input.youtube);
  const db = await getDb();
  const last = await db.execute(
    "SELECT COALESCE(MAX(position), 0) AS p FROM films",
  );
  const position = Number(last.rows[0].p) + 1;
  await db.execute({
    sql: "INSERT INTO films (position, src, poster, title, description, youtube, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [position, src, poster, input.title.trim(), input.description.trim(), youtube, Date.now()],
  });
  revalidate();
}

export async function updateFilmDetails(formData: FormData) {
  await assertAdmin();
  const title = str(formData, "title");
  const description = str(formData, "description");
  let youtube: string | null;
  try {
    youtube = youtubeOrNull(
      typeof formData.get("youtube") === "string"
        ? String(formData.get("youtube"))
        : null,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid YouTube link";
    redirect(`/admin/films/${num(formData, "id")}?error=${encodeURIComponent(message)}`);
  }
  await withRetry(async (db) => {
    await db.execute({
      sql: "UPDATE films SET title = ?, description = ?, youtube = ? WHERE id = ?",
      args: [title, description, youtube, num(formData, "id")],
    });
  });
  revalidate();
  redirect(`/admin/films/${num(formData, "id")}?saved=1`);
}

export async function replaceFilmVideo(id: number, src: string) {
  await assertAdmin();
  const video = requireUploaded(src, "videos");
  const db = await getDb();
  const current = await getFilm(id);
  if (current) await deleteObjectFor(current.src);
  await db.execute({
    sql: "UPDATE films SET src = ? WHERE id = ?",
    args: [video, id],
  });
  revalidate();
}

export async function setFilmPoster(id: number, src: string) {
  await assertAdmin();
  const poster = requireUploaded(src, "images");
  const db = await getDb();
  const current = await getFilm(id);
  if (current?.poster) await deleteObjectFor(current.poster);
  await db.execute({
    sql: "UPDATE films SET poster = ? WHERE id = ?",
    args: [poster, id],
  });
  revalidate();
}

export async function removeFilmPoster(formData: FormData) {  await assertAdmin();
  const db = await getDb();
  const current = await getFilm(num(formData, "id"));
  if (current?.poster) await deleteObjectFor(current.poster);
  await db.execute({
    sql: "UPDATE films SET poster = NULL WHERE id = ?",
    args: [num(formData, "id")],
  });
  revalidate();
  redirect(`/admin/films/${num(formData, "id")}?saved=1`);
}

export async function deleteFilm(formData: FormData) {
  await assertAdmin();
  const id = num(formData, "id");
  const db = await getDb();
  const current = await getFilm(id);
  if (current) {
    await deleteObjectFor(current.src);
    if (current.poster) await deleteObjectFor(current.poster);
  }
  await db.execute({ sql: "DELETE FROM films WHERE id = ?", args: [id] });
  revalidate();
  redirect("/admin/films");
}

export async function toggleFilmHome(formData: FormData) {
  await assertAdmin();
  const on = str(formData, "value") === "1" ? 1 : 0;
  await withRetry(async (db) => {
    await db.execute({
      sql: "UPDATE films SET home = ? WHERE id = ?",
      args: [on, num(formData, "id")],
    });
  });
  revalidate();
}

export async function moveFilm(formData: FormData) {
  await assertAdmin();
  const id = num(formData, "id");
  const dir = str(formData, "dir");
  const db = await getDb();
  const current = await getFilm(id);
  if (!current) return;
  const neighbor = await db.execute({
    sql:
      dir === "up"
        ? "SELECT id, position FROM films WHERE position < ? ORDER BY position DESC LIMIT 1"
        : "SELECT id, position FROM films WHERE position > ? ORDER BY position ASC LIMIT 1",
    args: [current.position],
  });
  const row = neighbor.rows[0];
  if (!row) return;
  await db.execute({
    sql: "UPDATE films SET position = CASE id WHEN ? THEN ? WHEN ? THEN ? END WHERE id IN (?, ?)",
    args: [current.id, Number(row.position), Number(row.id), current.position, current.id, Number(row.id)],
  });
  revalidate();
}

/* --------------------------------- gallery -------------------------------- */

export async function addGalleryItems(items: string[]) {
  await assertAdmin();
  if (items.length === 0) return;
  const urls = items.map((item) => requireUploaded(item, "images"));
  const db = await getDb();
  const last = await db.execute(
    "SELECT COALESCE(MAX(position), 0) AS p FROM gallery",
  );
  let position = Number(last.rows[0].p);
  for (const url of urls) {
    position += 1;
    await db.execute({
      sql: "INSERT INTO gallery (position, src, alt, created_at) VALUES (?, ?, '', ?)",
      args: [position, url, Date.now()],
    });
  }
  revalidate();
}

export async function replaceGalleryImage(id: number, src: string) {
  await assertAdmin();
  const image = requireUploaded(src, "images");
  const db = await getDb();
  const current = await db.execute({
    sql: "SELECT src FROM gallery WHERE id = ?",
    args: [id],
  });
  const row = current.rows[0];
  if (row) await deleteObjectFor(String(row.src));
  await db.execute({
    sql: "UPDATE gallery SET src = ? WHERE id = ?",
    args: [image, id],
  });
  revalidate();
}

export async function toggleGalleryHome(formData: FormData) {
  await assertAdmin();
  const on = str(formData, "value") === "1" ? 1 : 0;
  await withRetry(async (db) => {
    await db.execute({
      sql: "UPDATE gallery SET home = ? WHERE id = ?",
      args: [on, num(formData, "id")],
    });
  });
  revalidate();
}

export async function updateGalleryAlt(formData: FormData) {
  await assertAdmin();
  const alt = str(formData, "alt");
  const id = num(formData, "id");
  await withRetry(async (db) => {
    await db.execute({
      sql: "UPDATE gallery SET alt = ? WHERE id = ?",
      args: [alt, id],
    });
  });
  revalidate();
}

export async function deleteGalleryItem(formData: FormData) {
  await assertAdmin();
  const db = await getDb();
  await deleteObjectFor(str(formData, "current"));
  await db.execute({ sql: "DELETE FROM gallery WHERE id = ?", args: [num(formData, "id")] });
  revalidate();
}

export async function moveGalleryItem(formData: FormData) {
  await assertAdmin();
  const id = num(formData, "id");
  const dir = str(formData, "dir");
  const db = await getDb();
  const current = await db.execute({
    sql: "SELECT id, position FROM gallery WHERE id = ?",
    args: [id],
  });
  const c = current.rows[0];
  if (!c) return;
  const neighbor = await db.execute({
    sql:
      dir === "up"
        ? "SELECT id, position FROM gallery WHERE position < ? ORDER BY position DESC LIMIT 1"
        : "SELECT id, position FROM gallery WHERE position > ? ORDER BY position ASC LIMIT 1",
    args: [Number(c.position)],
  });
  const row = neighbor.rows[0];
  if (!row) return;
  await db.execute({
    sql: "UPDATE gallery SET position = CASE id WHEN ? THEN ? WHEN ? THEN ? END WHERE id IN (?, ?)",
    args: [Number(c.id), Number(row.position), Number(row.id), Number(c.position), Number(c.id), Number(row.id)],
  });
  revalidate();
}
