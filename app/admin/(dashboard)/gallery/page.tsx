import { Suspense } from "react";
import Image from "next/image";
import { connection } from "next/server";
import { listGallery, type GalleryItem } from "@/lib/db";
import {
  updateGalleryAlt,
  deleteGalleryItem,
  moveGalleryItem,
} from "@/app/admin/actions";
import {
  GalleryReplaceForm,
  GalleryUploadForm,
} from "@/components/admin/upload";
import { HomeToggle } from "@/components/admin/home-toggle";
import { remoteFromSrc } from "@/lib/storage";

export const metadata = { title: "Gallery — Studio CMS" };

export default async function GalleryAdminPage() {
  return (
    <Suspense fallback={null}>
      <GalleryContent />
    </Suspense>
  );
}

async function GalleryContent() {
  await connection();
  const items = await listGallery();
  const missingAlt = items.filter((item) => !item.alt.trim()).length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 md:py-16">
      <header className="flex flex-col gap-2 border-b border-stone-200/80 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
          Website content
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Studio gallery.
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-stone-600">
              {items.length} frame{items.length === 1 ? "" : "s"}
            </span>
            {missingAlt > 0 ? (
              <span className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                {missingAlt} no alt text
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <UploadCard />

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center text-sm text-stone-500">
          No frames yet. Upload your first batch above.
        </div>
      ) : (
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <li key={item.id}>
              <GalleryCard
                item={item}
                isFirst={index === 0}
                isLast={index === items.length - 1}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function UploadCard() {
  return (
    <details className="group rounded-3xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 sm:px-8">
        <span className="font-display text-2xl font-semibold">
          Upload frames
        </span>
        <span className="rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-transform group-open:hidden">
          Add
        </span>
        <span className="hidden rounded-full border border-stone-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-stone-600 group-open:inline-flex">
          Close
        </span>
      </summary>
      <GalleryUploadForm />
    </details>
  );
}

function GalleryCard({
  item,
  isFirst,
  isLast,
}: {
  item: GalleryItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <article className="rounded-3xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-500">
            {item.position}
          </span>
          {item.alt.trim() ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700">
              Alt text
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700">
              No alt text
            </span>
          )}
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
            {remoteFromSrc(item.src) ? "Cloud" : "Local"}
          </span>
          <HomeToggle kind="gallery" id={item.id} on={item.home} />
        </div>
        <div className="flex items-center gap-1.5">
          <form action={moveGalleryItem}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              name="dir"
              value="up"
              disabled={isFirst}
              aria-label="Move frame up"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors enabled:hover:border-stone-800 enabled:hover:text-stone-900 disabled:opacity-40"
            >
              ▲
            </button>
          </form>
          <form action={moveGalleryItem}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              name="dir"
              value="down"
              disabled={isLast}
              aria-label="Move frame down"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors enabled:hover:border-stone-800 enabled:hover:text-stone-900 disabled:opacity-40"
            >
              ▼
            </button>
          </form>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          <Image
            src={item.src}
            alt={item.alt.trim() || "Gallery frame without alt text"}
            width={800}
            height={1000}
            className="mx-auto max-h-[420px] w-auto object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5">
        <form action={updateGalleryAlt} className="flex items-end gap-2">
          <input type="hidden" name="id" value={item.id} />
          <label className="flex-1">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Alt text / SEO caption
            </span>
            <input
              type="text"
              name="alt"
              defaultValue={item.alt}
              placeholder="Describe this frame…"
              className="w-full rounded-xl border border-stone-300 bg-[#FAF9F6] px-4 py-2.5 text-sm outline-none focus:border-stone-900 focus:bg-white"
            />
          </label>
          <button
            type="submit"
            name="save-alt"
            value="1"
            className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-black"
          >
            Save
          </button>
        </form>

        <div className="border-t border-stone-200/80 pt-4">
          <GalleryReplaceForm id={item.id} />

          <div className="mt-3 flex items-end justify-between gap-3">
            <details className="relative flex-none">
              <summary
                className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete frame"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
                  <path d="M3.5 6h17M8 6V4h8v2M6.5 6l1 13h9l1-13M10 10.5v5M14 10.5v5" />
                </svg>
              </summary>
              <form
                action={deleteGalleryItem}
                className="absolute right-0 top-11 z-10 flex w-56 flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="current" value={item.src} />
                <p className="text-xs text-stone-600">
                  Remove this frame and its file from storage?
                </p>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-red-700"
                >
                  Delete permanently
                </button>
              </form>
            </details>
          </div>
        </div>
      </div>
    </article>
  );
}
