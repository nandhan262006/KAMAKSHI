import type { Metadata } from "next";
import Link from "next/link";
import { LiteYouTube } from "@/components/lite-youtube";
import { WHATSAPP } from "@/lib/contact";
import { site } from "@/lib/site";

/** The client's own YouTube teasers, shown exactly like the home "Watch" block. */
const BEFORE_YOU_BOOK = [
  { id: "XqcKejNr598", num: "01", title: "Gowthami Bride Haldi Teaser | Nellore Telugu Wedding" },
  { id: "ipHzZUpOyXI", num: "02", title: "Muni Megha Sri & Manoj Wedding & Reception Teaser | Nellore Cinematic Wedding" },
  { id: "IzJdDni6_EU", num: "03", title: "Lasya Seemantham Teaser | Telugu Baby Shower Film | Nellore" },
  { id: "2Xv7W6JR7Ng", num: "04", title: "Loukya Half Saree Pre-Shoot Song | Outdoor Half Saree Film | Nellore" },
  { id: "7pwKZgK5wSc", num: "05", title: "Kumar Siva Groom Haldi Teaser | Nellore Telugu Wedding" },
  { id: "x8D2MPGNYn0", num: "06", title: "Gowthami & Guru Prakash Reception Teaser | Nellore Cinematic Wedding" },
];

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

export default function FilmsPage() {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGallery",
    "@id": `${site.url}/films#videogallery`,
    name: "Wedding Films by Kamakshi Cinema Photography",
    url: `${site.url}/films`,
    description:
      "Wedding teasers and films by Kamakshi Cinema Photography — shot, edited and graded in-house with RAW capture and true 4K delivery.",
    publisher: { "@id": `${site.url}/#organization` },
    associatedMedia: BEFORE_YOU_BOOK.map((v) => ({
      "@type": "VideoObject",
      name: v.title,
      description:
        "Wedding teaser by Kamakshi Cinema Photography — shot, edited and graded in-house in Nellore.",
      url: `https://www.youtube.com/watch?v=${v.id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      embedUrl: `${site.url}/films`,
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

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              Before you book, watch these.
            </h2>
            <p className="text-pretty text-muted-foreground">
              Photography ఎంచుకోవడం కేవలం price లేదా camera ఆధారంగా కాకుండా,
              quality • experience • editing • data safety • final delivery
              ఆధారంగా ఎంచుకోవడం ముఖ్యం.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {BEFORE_YOU_BOOK.map((v) => (
              <article key={v.id} className="flex flex-col gap-4">
                <LiteYouTube id={v.id} title={v.title} />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {v.num}
                  </p>
                  <h3 className="font-medium text-foreground">{v.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent px-6 py-14 text-center ring-1 ring-primary/20">
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
