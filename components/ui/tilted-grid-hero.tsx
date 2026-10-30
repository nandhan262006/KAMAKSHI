"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * Tiles share one height but not one width: each takes its image's own
 * shape, so portraits run narrow and landscapes wide down the same row.
 *
 * A CSS box can't bend, so every tile is cut into SLICES vertical strips,
 * each a flat facet of the cylinder showing its share of the image. The
 * strips sit still inside their tile, each turned its own few degrees
 * round the cylinder's axis, and the tile (preserve-3d) is what moves: one
 * rotateY about that same axis carries the whole tile along the arc. A
 * tile is one animation, so its strips can never drift apart or show
 * different images. Only a tile's delay differs, and that sets where on
 * the arc it sits — spaced by its own width, so the gap between tiles
 * stays even across mixed shapes. The band is transform-only on the
 * compositor; the fade is a static mask over it.
 *
 * The loop holds whole passes of the image list — a tile keeps its image
 * for good, so the pattern of widths repeats exactly round the wrap and
 * every image is on the row at once. Short lists simply repeat.
 *
 * The only JS is a ResizeObserver that sizes the loop, and a loader that
 * reads each image's shape (unless the image states it) before the band
 * shows.
 * ─────────────────────────────────────────────────────────────── */

// Strips per tile. Each is a few degrees of arc, too little to read as a
// facet; fewer starts to show corners along the top and bottom edges. A
// tight curve wraps a tile round a wide arc, so it needs this many.
const SLICES = 10;

// Camera distance from the screen, as a multiple of the cylinder's radius.
// Just past the axis, so the ends come right up to the lens and swell; much
// further back and the row flattens out however tight the cylinder.
const CAMERA = 1.6;

/**
 * Cylinder radius, as a share of the hero's width, that puts the frame's
 * edge `bend` radians round the arc as seen through the camera:
 * r·sinθ · CAMERA / (CAMERA − 1 + cosθ) = width / 2, solved for r.
 */
function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

// No tile is ever wider than this share of the hero, so a phone still
// shows its neighbours instead of one landscape edge to edge.
const MAX_WIDTH = 55;

type Layout = {
  columns: number;
  sweep: number;
  unit: number;
  limit: number;
};

/**
 * Lays the loop on the cylinder. The radius puts the frame's edge `bend`
 * radians round the arc (see `arc`). `unit` is the arc one tile-height
 * spans, in degrees; `limit` how far round a tile's centre can go before
 * the whole tile is off-screen. The loop reaches past `limit`, and rounds
 * up to whole passes of the list so the wrap is seamless.
 */
function measure(
  width: number,
  height: number,
  tile: number,
  gap: number,
  bend: number,
  aspects: number[],
): Layout | null {
  const n = aspects.length;
  if (n === 0) return null;
  const maxAspect = Math.max(...aspects);
  const h = Math.min(
    (tile / 100) * height,
    ((MAX_WIDTH / 100) * width) / maxAspect,
  );
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0)) return null;
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (a: number) => (a + gap / 100) * unit;
  const cycle = aspects.reduce((sum, a) => sum + pitch(a), 0);
  const limit = deg(bend) + (maxAspect * unit) / 2;
  const passes = Math.max(1, Math.ceil((2 * limit) / cycle));
  const round = (x: number) => +x.toFixed(4);
  return {
    columns: passes * n,
    sweep: round((passes * cycle) / 2),
    unit: round(unit),
    limit: round(limit),
  };
}

const same =
  (a: Layout | null, b: Layout | null) =>
  !!a &&
  !!b &&
  a.columns === b.columns &&
  a.sweep === b.sweep &&
  a.unit === b.unit &&
  a.limit === b.limit;

export type TiltedGridImage = {
  src: string;
  /**
   * Width over height. Leave it out and the component reads the shape
   * from the image itself once it has loaded; this is the fallback for
   * then, and for images that never load.
   */
  aspect?: number;
  /** Only used if you drop the decorative treatment; the band is aria-hidden. */
  alt?: string;
};

export type TiltedGridHeroProps = {
  /**
   * Images run along the row in order, each at its own shape. The loop
   * holds whole passes of the list, so every image is on the row at once;
   * short lists simply repeat.
   */
  images: TiltedGridImage[];
  /**
   * Seconds for the row to advance by one average tile, so a phone and an
   * ultrawide move at the same pace.
   * @default 4
   */
  speed?: number;
  /** Tile height, as a percentage of the hero's height. @default 26 */
  tileHeight?: number;
  /**
   * Width over height assumed while images are still being measured, and
   * for any that never load.
   * @default 16 / 9
   */
  aspectRatio?: number;
  /** Space between tiles, as a percentage of a tile's height. @default 6 */
  gap?: number;
  /** Vertical centre of the row, as a percentage of the hero's height. @default 56 */
  axis?: number;
  /**
   * How far the row has bent round by the frame's edge, in degrees. Higher
   * curls the ends harder toward the viewer. Clamped to 5–85.
   * @default 80
   */
  curve?: number;
  /** Width of the fade at each end, as a percentage of the hero's width. @default 12 */
  fade?: number;
  /** Content rendered above the band. */
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  // Each image's shape, width over height: stated on the image, else read
  // from it once loaded, else the fallback.
  const [natural, setNatural] = React.useState<Record<string, number>>({});
  const [settled, setSettled] = React.useState(false);
  const aspects = React.useMemo(
    () => images.map((im) => im.aspect ?? natural[im.src] ?? aspectRatio),
    [images, natural, aspectRatio],
  );

  // Null until the observer has measured the hero. The band stays hidden
  // until then, so a first paint laid out for the wrong size never shows.
  const [layout, setLayout] = React.useState<Layout | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const next = measure(
        Math.round(width / 8) * 8,
        Math.round(height / 8) * 8,
        tileHeight,
        gap,
        bend,
        aspects,
      );
      setLayout((prev) => (same(prev, next) ? prev : next));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, gap, bend, aspects]);

  // Fetch every image up front, reading each one's shape off it as it
  // arrives. Shapes settle before the band shows, so a tile never resizes
  // in view.
  React.useEffect(() => {
    let alive = true;
    void Promise.all(
      images.map((im) => {
        if (im.aspect) {
          new Image().src = im.src;
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          const el = new Image();
          el.onload = () => {
            if (alive && el.naturalWidth > 0) {
              const a = el.naturalWidth / el.naturalHeight;
              setNatural((prev) =>
                prev[im.src] === a ? prev : { ...prev, [im.src]: a },
              );
            }
            resolve();
          };
          el.onerror = () => resolve();
          el.src = im.src;
        });
      }),
    ).then(() => alive && setSettled(true));
    return () => {
      alive = false;
    };
  }, [images]);

  const { columns, sweep, unit, limit } =
    layout ??
    measure(1200, 560, tileHeight, gap, bend, aspects) ?? {
      columns: 0,
      sweep: 0,
      unit: 0,
      limit: 0,
    };

  // Every length is a multiple of the tile's height, which follows the
  // hero's height until the widest shape caps it on narrow screens.
  const maxAspect = aspects.length ? Math.max(...aspects) : aspectRatio;
  const u = (n: number) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(
      MAX_WIDTH / maxAspect
    ).toFixed(4)}cqw))`;

  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;
  // Out to the axis, round it, back in: a box sits on the cylinder at the
  // angle rotateY gives it.
  const turn = (deg: number) =>
    `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  // Beyond `limit` a tile is wholly off-screen, so it is hidden there. The
  // loop's ends, where it wraps, fall inside that stretch, and so do tiles
  // swinging round behind the camera.
  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    // Pausing rather than removing the motion keeps the band whole: every
    // tile is already placed by its negative delay, so it freezes as a
    // finished still.
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const duration = columns * speed;
  const avgPitch = columns > 0 ? (2 * sweep) / columns : 0;
  const mask =
    fade > 0
      ? `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${
          100 - fade
        }%,transparent)`
      : undefined;

  // Tile t sits `start` degrees of arc along the loop, so its delay sets
  // where on the arc it starts. Tiles are numbered in the order they come
  // on, tile 0 furthest back.
  const prefix = aspects.reduce<number[]>(
    (sums, a) => [...sums, sums[sums.length - 1] + (a + gap / 100) * unit],
    [0],
  );
  const cycle = prefix[aspects.length] || 0;
  const tiles = Array.from({ length: columns }, (_, t) => ({
    t,
    aspect: aspects[t % aspects.length],
    start: Math.floor(t / aspects.length) * cycle + prefix[t % aspects.length],
  }));

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "size", ...props.style }}
    >
      <style>{css}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: layout && settled ? 1 : 0,
          // A shared vanishing point on the row's centre line, so the ends
          // grow evenly above and below it as they come toward the viewer.
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}      >
        {tiles.map(({ t, aspect, start }) => {
          const img = images[t % Math.max(images.length, 1)];
          const share = aspect / SLICES;
          return (
            <div
              key={t}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${u(aspect / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspect),
                height: u(1),
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                willChange: "transform",
                animation: `${orbit} ${duration}s linear ${+(
                  -(start * speed) / avgPitch
                ).toFixed(3)}s infinite`,
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className="absolute top-0 overflow-hidden bg-muted"
                  style={{
                    // Every strip starts at the tile's centre and is turned
                    // round the axis to its own place on the arc.
                    left: u((aspect - share) / 2),
                    // A pixel wider than its share, so neighbouring facets
                    // overlap and no hairline opens between them. The last
                    // has no neighbour to cover.
                    width:
                      k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn(
                      (aspect / 2 - (k + 0.5) * share) * unit,
                    ),
                  }}
                >
                  {img ? (
                    <img
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? "") : ""}
                      draggable={false}
                      loading="eager"
                      decoding="sync"
                      className="absolute top-0 max-w-none object-cover"
                      style={{
                        left: u(-k * share),
                        width: u(aspect),
                        height: u(1),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
