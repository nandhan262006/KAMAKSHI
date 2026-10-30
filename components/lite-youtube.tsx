"use client";

import * as React from "react";

export function LiteYouTube({ id, title }: { id: string; title: string }) {
  const routerRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  // Leaving the viewport (scrolling away, navigating cards) unmounts the
  // iframe, so audio never keeps playing in the background.
  React.useEffect(() => {
    if (!open) return;
    const node = routerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setOpen(false);
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [open]);

  return (
    <div ref={routerRef} className="relative">
      {open ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted text-left"
          aria-label={`Play video: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            onError={(e) => {
              // Some uploads only ship a 480×360 HQ thumb — fall back gracefully.
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = "1";
                img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
              }
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                className="ml-0.5 h-6 w-6 fill-foreground"
                aria-hidden
              >
                <path d="M8 5.5v13l11-6.5Z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
