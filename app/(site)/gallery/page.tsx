import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getGallery } from "@/lib/content";
import { WHATSAPP } from "@/lib/contact";
import { absoluteMediaUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Full gallery from the studio feed — wedding and pre-wedding frames by Kamakshi Cinema Photography.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    type: "website",
    url: `${site.url}/gallery`,
    title: "Gallery — Kamakshi Cinema Photography",
    description:
      "Wedding and pre-wedding frames from recent events — candid, traditional and drone coverage.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery — Kamakshi Cinema Photography",
    description:
      "Wedding and pre-wedding frames from recent events — candid, traditional and drone coverage.",
  },
};

export default async function GalleryPage() {
  const frames = await getGallery();

  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${site.url}/gallery#imagegallery`,
    name: "Gallery — Kamakshi Cinema Photography",
    url: `${site.url}/gallery`,
    description:
      "Wedding and pre-wedding frames from recent events — candid, traditional and drone coverage.",
    publisher: { "@id": `${site.url}/#organization` },
    associatedMedia:
      frames.length > 0
        ? frames.map((frame) => ({
            "@type": "ImageObject",
            contentUrl: absoluteMediaUrl(frame.src),
            name:
              frame.alt.trim() ||
              "Wedding frame by Kamakshi Cinema Photography",
          }))
        : undefined,
  };

  return (
    <>
      <main className="flex-1 pt-16">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }}
        />
        <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pb-4 pt-16 md:pt-24">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tighter text-foreground sm:text-5xl md:text-6xl">
            The full gallery.
          </h1>
          <p lang="te" className="font-telugu text-lg leading-relaxed text-muted-foreground">
            మా Instagram మరియు Portfolio లో కనిపించే క్వాలిటీనే మీ ఫైనల్ అవుట్‌పుట్‌లో కూడా పొందుతారు.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary"
          >
            ← Back to home
          </Link>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>figure]:mb-4">
            {frames.map((frame, i) => (
              <figure key={frame.id} className="overflow-hidden rounded-xl">
                <Image
                  src={frame.src}
                  alt={frame.alt.trim() || `Wedding frame ${i + 1} from the Kamakshi Cinema Photography gallery`}
                  width={800}
                  height={1000}
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                  loading="lazy"
                  className="h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </figure>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent px-6 py-14 text-center ring-1 ring-primary/20">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">
              Like what you see?
            </h2>
            <p className="max-w-md text-pretty text-sm text-muted-foreground">
              These are frames from our recent events — yours could be next.
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
    </>
  );
}
