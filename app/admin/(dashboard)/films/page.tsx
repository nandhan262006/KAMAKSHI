import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { listFilms } from "@/lib/db";
import {
  moveFilm,
  deleteFilm,
} from "@/app/admin/actions";
import { FilmCreateForm } from "@/components/admin/upload";
import { HomeToggle } from "@/components/admin/home-toggle";
import { remoteFromSrc } from "@/lib/storage";

export const metadata = { title: "Films — Studio CMS" };

export default async function FilmsPage() {
  return (
    <Suspense fallback={null}>
      <FilmsContent />
    </Suspense>
  );
}

async function FilmsContent() {
  await connection();
  const films = await listFilms();
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 md:py-16">
      <header className="flex flex-col gap-2 border-b border-stone-200/80 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
          Website content
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Wedding films.
          </h1>
          <span className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-stone-600">
            {films.length} film{films.length === 1 ? "" : "s"}
          </span>
        </div>
      </header>

      <details className="group rounded-3xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 sm:px-8">
          <span className="font-display text-2xl font-semibold">
            Add a new film
          </span>
          <span className="rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-transform group-open:hidden">
            Upload
          </span>
          <span className="hidden rounded-full border border-stone-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-stone-600 group-open:inline-flex">
            Close
          </span>
        </summary>
        <FilmCreateForm />
      </details>

      <FilmList films={films} />
    </div>
  );
}

type Film = Awaited<ReturnType<typeof listFilms>>[number];

function FilmList({ films }: { films: Film[] }) {
  if (films.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center text-sm text-stone-500">
        No films yet. Upload your first one above.
      </div>
    );
  }
  return (
    <ol className="flex flex-col">
      {films.map((film, index) => (
        <li
          key={film.id}
          className="grid grid-cols-[auto_1fr] gap-4 border-b border-stone-200/80 py-5 last:border-b-0 sm:grid-cols-[auto_auto_1fr_auto] sm:items-start sm:gap-6"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-500">
            {index + 1}
          </span>
          <video
            src={film.src}
            poster={film.poster ?? undefined}
            preload="metadata"
            muted
            className="hidden w-44 aspect-video rounded-xl border border-stone-200 bg-stone-100 object-cover sm:block"
          />
          <div className="flex flex-col gap-1 sm:min-w-0 sm:col-start-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">
                {film.title.trim() || "Untitled film"}
              </p>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                {remoteFromSrc(film.src) ? "Cloud" : "Local"}
              </span>
              <HomeToggle kind="film" id={film.id} on={film.home} />
            </div>
            {film.description ? (
              <p className="line-clamp-2 text-sm text-stone-500">
                {film.description}
              </p>
            ) : (
              <p className="text-sm italic text-stone-400">
                No description yet
              </p>
            )}
          </div>
          <div className="col-start-2 flex items-center gap-2 pt-2 sm:col-start-4 sm:pt-0">
            <FilmRowActions film={film} isFirst={index === 0} isLast={index === films.length - 1} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function FilmRowActions({ film, isFirst, isLast }: { film: Film; isFirst: boolean; isLast: boolean }) {
  return (
    <>
      <form action={moveFilm}>
        <input type="hidden" name="id" value={film.id} />
        <button
          type="submit"
          name="dir"
          value="up"
          disabled={isFirst}
          aria-label="Move film up"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors enabled:hover:border-stone-800 enabled:hover:text-stone-900 disabled:opacity-40"
        >
          ▲
        </button>
      </form>
      <form action={moveFilm}>
        <input type="hidden" name="id" value={film.id} />
        <button
          type="submit"
          name="dir"
          value="down"
          disabled={isLast}
          aria-label="Move film down"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors enabled:hover:border-stone-800 enabled:hover:text-stone-900"
        >
          ▼
        </button>
      </form>
      <Link
        href={`/admin/films/${film.id}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:border-stone-800 hover:text-stone-900"
        aria-label="Edit film"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14.5 7.5l2 2" />
        </svg>
      </Link>
      <details className="relative">
        <summary
          className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete film"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
            <path d="M3.5 6h17M8 6V4h8v2M6.5 6l1 13h9l1-13M10 10.5v5M14 10.5v5" />
          </svg>
        </summary>
        <form
          action={deleteFilm}
          className="absolute right-0 top-10 z-10 flex w-56 flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <input type="hidden" name="id" value={film.id} />
          <p className="text-xs text-stone-600">
            Delete this film and its file from storage?
          </p>
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-red-700"
          >
            Delete permanently
          </button>
        </form>
      </details>
    </>
  );
}
