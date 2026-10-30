import { AnimatedMarqueeHero } from "@/components/ui/animated-marquee-hero";
import {
  WhyChoose,
  Watch,
  Films,
  Gallery,
  Promise,
  Explore,
  Footer,
} from "@/components/home-sections";
import { WHATSAPP } from "@/lib/contact";

// Our own work, straight from the studio feed in /public/downloads.
// Portrait sources are cropped to the tiles by object-cover.
const IMAGES = [
  {
    src: "/downloads/2026-10-16_04-34-05_UTC_1.webp",
    alt: "Bride in gold kanjivaram fastening her earring",
  },
  {
    src: "/downloads/2026-03-23_11-54-31_UTC_1.jpg",
    alt: "Couple seated under the haldi canopy",
  },
  {
    src: "/downloads/2026-10-06_09-55-19_UTC_1.webp",
    alt: "Bride behind a veil holding a rose bouquet",
  },
  {
    src: "/downloads/2026-04-08_05-33-34_UTC_1.jpg",
    alt: "Laughing bride in sunglasses during the haldi splash",
  },
  {
    src: "/downloads/2026-05-28_05-33-36_UTC_1.webp",
    alt: "Bride in pink silk saree touching the blossoms",
  },
  {
    src: "/downloads/2026-09-30_05-45-11_UTC_1.webp",
    alt: "Wedding moment from the studio feed",
  },
  {
    src: "/downloads/2026-08-01_12-01-45_UTC_1.webp",
    alt: "Wedding moment from the studio feed",
  },
  {
    src: "/downloads/2026-09-25_11-16-45_UTC_1.webp",
    alt: "Wedding moment from the studio feed",
  },
  {
    src: "/downloads/2026-10-16_04-34-05_UTC_4.webp",
    alt: "Wedding moment from the studio feed",
  },
  {
    src: "/downloads/2026-04-08_05-33-34_UTC_5.jpg",
    alt: "Wedding moment from the studio feed",
  },
];

export default function Home() {
  return (
    <>
      <main id="top" className="flex-1">
        <AnimatedMarqueeHero
          ctaText="Book your date on WhatsApp"
          href={WHATSAPP}
          description={
            <>
              <span
                lang="te"
                className="font-telugu block text-lg leading-relaxed"
              >
                మీ Wedding Memories జీవితాంతం మీతో ఉంటాయి.
              </span>
              <span className="mt-2 block text-base leading-relaxed">
                Nellore's own wedding photography studio — every moment
                captured at its absolute best with quality, experience,
                editing, data safety, and{" "}
                <strong className="font-semibold text-foreground">
                  Instant Delivery
                </strong>{" "}
                that never keeps you waiting.
              </span>
            </>
          }
          ctaSecondary={
            <a
              href="#contact"
              className="rounded-full border border-border bg-background/70 px-8 py-3.5 font-medium text-foreground backdrop-blur transition-colors hover:border-foreground/50"
            >
              Explore our work
            </a>
          }
          belowCta={
            <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground sm:text-[11px]">
              Instant Delivery · Quality · Experience · Editing · Data Safety
            </p>
          }
          images={IMAGES.map((im) => im.src)}
        />
        <WhyChoose />
        <Films />
        <Gallery />
        <Watch />
        <Promise />
        <Explore />
      </main>
      <Footer />
    </>
  );
}
