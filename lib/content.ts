import { cacheLife, cacheTag } from "next/cache";
import { getDb, listFilms, listGallery } from "@/lib/db";

export async function getFilms() {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  await getDb();
  return listFilms();
}

export async function getGallery() {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  await getDb();
  return listGallery();
}

/** Only the frames and films explicitly switched ON for the home page. */
export async function getHomeFilms() {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  await getDb();
  return (await listFilms()).filter((film) => film.home);
}

export async function getHomeGallery() {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  await getDb();
  return (await listGallery()).filter((item) => item.home);
}
