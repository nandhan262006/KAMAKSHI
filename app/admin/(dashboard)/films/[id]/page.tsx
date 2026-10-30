import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getFilm } from "@/lib/db";
import {
  updateFilmDetails,
  removeFilmPoster,
} from "@/app/admin/actions";
import {
  FilmPosterReplaceForm,
  FilmVideoReplaceForm,
} from "@/components/admin/upload";

export const metadata = { title: "Edit film — Studio CMS" };

export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <FilmEditorFilm params={params} />
    </Suspense>
  );
}

async function FilmEditorFilm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id: filmId } = await params;
  const film = await getFilm(Number(filmId));
  if (!film) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12 md:py-16">
      <header className="flex flex-col gap-3 border-b border-stone-200/80 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
          Website content
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            {film.title.trim() || "Edit film"}
          </h1>
          <Link
            href="/admin/films"
            className="rounded-full border border-stone-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-stone-600 transition-colors hover:border-stone-900 hover:text-stone-900"
          >
            ← All films
          </Link>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-stone-200/80 bg-black">
        <video
          src={film.src}
          poster={film.poster ?? undefined}
          controls
          preload="metadata"
          className="aspect-video w-full"
        />
      </section>

      <DetailsForm film={film} />

      <PosterCard film={film} />

      <VideoReplaceCard film={film} />
    </div>
  );
}

function DetailsForm({
  film,
}: {
  film: NonNullable<Awaited<ReturnType<typeof getFilm>>>;
}) {
  return (
    <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Film details</h2>
      <form action={updateFilmDetails} className="mt-5 flex flex-col gap-4">
        <input type="hidden" name="id" value={film.id} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Title
          </span>
          <input
            type="text"
            name="title"
            defaultValue={film.title}
            className="rounded-xl border border-stone-300 bg-[#FAF9F6] px-4 py-3 text-sm outline-none focus:border-stone-900 focus:bg-white"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Description
          </span>
          <textarea
            name="description"
            rows={4}
            defaultValue={film.description}
            className="rounded-xl border border-stone-300 bg-[#FAF9F6] px-4 py-3 text-sm outline-none focus:border-stone-900 focus:bg-white"
          />
        </label>
        <div className="pt-1">
          <button
            type="submit"
            className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-black"
          >
            Save details
          </button>
        </div>
      </form>
    </section>
  );
}

function PosterCard({
  film,
}: {
  film: NonNullable<Awaited<ReturnType<typeof getFilm>>>;
}) {
  return (
    <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Poster image</h2>
      <p className="mt-1 text-sm text-stone-500">
        Optional cover shown before the video plays. Without one, the first
        frame of the video is used.
      </p>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="w-56 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          <div className="aspect-video">
            {film.poster ? (
              <Image
                src={film.poster}
                alt="Film poster"
                width={640}
                height={360}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-stone-400">
                First frame
              </div>
            )}
          </div>
        </div>
        <div className="w-full max-w-md gap-y-4">
          <FilmPosterReplaceForm filmId={film.id} />
        </div>
        {film.poster ? (
          <form action={removeFilmPoster} className="flex-none">
            <input type="hidden" name="id" value={film.id} />
            <button
              type="submit"
              className="rounded-xl border border-stone-200 px-6 py-3 text-sm font-medium text-stone-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              Remove poster
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}

function VideoReplaceCard({
  film,
}: {
  film: NonNullable<Awaited<ReturnType<typeof getFilm>>>;
}) {
  return (
    <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Replace video</h2>
      <p className="mt-1 text-sm text-stone-500">
        Upload a new master file — the old video is removed from storage.
      </p>
      <div className="mt-5 max-w-xl">
        <FilmVideoReplaceForm filmId={film.id} />
      </div>
    </section>
  );
}
