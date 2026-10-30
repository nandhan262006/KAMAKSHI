"use client";

import * as React from "react";
import { site } from "@/lib/site";

const ELFSIGHT_PLATFORM_ID = "elfsight-platform-script";

/**
 * Google reviews via an Elfsight widget (snippet pasted by the studio owner).
 * platform.js loads once after hydration; the embed div carries
 * data-elfsight-app-lazy, so Elfsight only initializes the widget when the
 * section scrolls into view — homepage LCP stays untouched.
 */
export function GoogleReviews() {
  React.useEffect(() => {
    if (!document.getElementById(ELFSIGHT_PLATFORM_ID)) {
      const script = document.createElement("script");
      script.id = ELFSIGHT_PLATFORM_ID;
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section
      id="reviews"
      className="mx-auto max-w-6xl px-6 py-24 md:py-32"
      aria-label="Google reviews"
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Loved in Nellore
        </p>
        <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          What couples say.
        </h2>
      </div>
      <div className="mt-10 min-h-[380px] rounded-2xl border border-border bg-background">
        <div
          className="elfsight-app-4de03da0-51ed-4b75-a83a-631a14b0b95a"
          data-elfsight-app-lazy
        />
      </div>
      <a
        href={site.socials[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block text-sm font-medium text-foreground transition-colors hover:text-primary"
      >
        Read all reviews on Google →
      </a>
    </section>
  );
}
