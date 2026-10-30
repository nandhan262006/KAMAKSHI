import type { Metadata } from "next";
import Link from "next/link";
import { FilmCard } from "@/components/film-card";
import { getFilms } from "@/lib/content";
import { WHATSAPP } from "@/lib/contact";
import { absoluteMediaUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wedding Films",
  description:
    "Recent wedding films by Kamakshi Cinema Photography — wedding films and cinematography, shot and graded in-house. Like what you see? Book your date.",
  alternates: { canonical: "/films" },
  openGraph: {
    type: "website",
    url: `${site.url}/films`,
    title: "Wedding Films — Kamakshi Cinema Photography",
    description:
      "Recent wedding films and cinematography — every film shot, edited and graded in-house. RAW capture, 10-bit colour, true 4K delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Films — Kamakshi Cinema Photography",
    description:
      "Recent wedding films and cinematography — every film shot, edited and graded in-house.",
  },
};

export default async function FilmsPage() {
  const films = await getFilms();

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGallery",
    "@id": `${site.url}/films#videogallery`,
    name: "Wedding Films by Kamakshi Cinema Photography",
    url: `${site.url}/films`,
    description:
      "Recent wedding films and cinematography — shot, edited and graded in-house with RAW capture and true 4K delivery.",
    publisher: { "@id": `${site.url}/#organization` },
    associatedMedia: films.map((film) => ({
      "@type": "VideoObject",
      name: film.title.trim() || "Wedding film by Kamakshi Cinema Photography",
      description:
        film.description.trim() ||
        "Wedding cinematography by Kamakshi Cinema Photography — shot and graded in-house.",
      contentUrl: absoluteMediaUrl(film.src),
      ...(film.poster
        ? {
            thumbnailUrl: absoluteMediaUrl(film.poster),
          }
        : null),
      uploadDate: new Date(film.createdAt).toISOString(),
    })),
  };

  return (
    <main className="flex-1 pt-16">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pb-4 pt-16 md:pt-24">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tighter text-foreground sm:text-5xl md:text-6xl">
          The wedding films.
        </h1>
        <p lang="te" className="font-telugu text-lg leading-relaxed text-muted-foreground">
          ప్రతి వెడ్డింగ్ ఫిల్మ్ మా టీమే shoot చేసి, edit చేసి, grade చేసిందే. మీరు చూసే క్వాలిటీనే మీ ఫిల్మ్‌లో కూడా పొందుతారు.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary"
        >
          ← Back to home
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        {films.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Films are being prepared — check back soon.
          </p>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 md:gap-6">
            {films.map((film) => (
              <div key={film.id} className="flex flex-col gap-3">
                <FilmCard src={film.src} poster={film.poster} />
                {film.title.trim() ? (
                  <h2 className="text-sm font-medium text-foreground">
                    {film.title}
                  </h2>
                ) : null}
                {film.description.trim() ? (
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {film.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent px-6 py-14 text-center ring-1 ring-primary/20">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            Your story deserves this.
          </h2>
          <p className="max-w-md text-pretty text-sm text-muted-foreground">
            These are films from our recent events — yours could be next.
          </p>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-white shadow-[0_8px_28px_rgba(236,30,140,0.35)] transition-transform hover:scale-[1.03]"
          >
            Book your date on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
