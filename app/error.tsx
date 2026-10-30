"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70dvh] flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Something went wrong
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
        We&rsquo;ll be right back.
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.digest
          ? `Error reference: ${error.digest}`
          : "An unexpected error interrupted this page."}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
