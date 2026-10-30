import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70dvh] flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        404 — Page not found
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
        This frame doesn&rsquo;t exist.
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you&rsquo;re looking for moved or never existed. Explore our
        films and gallery instead.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          Back to home
        </Link>
        <Link
          href="/gallery"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
        >
          View gallery
        </Link>
      </div>
    </main>
  );
}
