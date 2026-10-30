import Link from "next/link";
import Image from "next/image";
import { FilmCard } from "@/components/film-card";
import { LiteYouTube } from "@/components/lite-youtube";
import { getHomeFilms, getHomeGallery } from "@/lib/content";
import {
  IconArrow,
  IconBolt,
  IconBrush,
  IconCamera,
  IconCloud,
  IconFilm,
  IconLink,
  IconPen,
  IconShield,
  IconUhd,
} from "@/components/icons";
import { WHATSAPP } from "@/lib/contact";

const WHY = [
  {
    icon: IconBolt,
    title: "Instant Delivery",
    copy: "Our main promise — lightning-fast delivery. Your edited photos and films are ready and shared on your online drive in record time, while the celebration is still fresh in your hearts.",
    featured: true,
  },
  {
    icon: IconCamera,
    title: "RAW Photography",
    copy: "Every photo is recorded in RAW format — better skin tones, richer colours and far more detail preserved in every frame.",
  },
  {
    icon: IconFilm,
    title: "LOG & 10-Bit Video",
    copy: "Video is shot in LOG and 10-bit professional formats, leaving the maximum room for cinema-grade colour.",
  },
  {
    icon: IconBrush,
    title: "Professional Editing & Colour Grading",
    copy: "Every photo and video is edited and graded for a classy, natural, timeless look — the quality you see on our Instagram is exactly the quality you receive.",
  },
  {
    icon: IconUhd,
    title: "True 4K Delivery",
    copy: "Most studios shoot in 4K but deliver Full HD. We deliver in original 4K quality wherever possible, so your videos still look stunning decades from now.",
  },
  {
    icon: IconPen,
    title: "In-House Editing Team",
    copy: "We own our editing team and high-end editing systems. Nothing is outsourced — full control over quality, and faster delivery.",
  },
  {
    icon: IconShield,
    title: "Double Data Backup",
    copy: "Every event's data is double-backed-up, without exception. There is no compromise on the safety of your memories.",
  },
  {
    icon: IconCloud,
    title: "Easy Online Access",
    copy: "When your photos are ready, you get one online drive link — view, download and share with family and friends from anywhere.",
  },
];

const WATCH = [
  {
    id: "2is-I_Uxm2k",
    num: "01",
    title: "Traditional Photography vs Candid Photography",
    telugu:
      "Traditional & Candid Photography మధ్య తేడా, ఏ సందర్భంలో ఏది అవసరమో తెలుసుకోండి.",
  },
  {
    id: "bavFMhlG_Eg",
    num: "02",
    title: "What to Know Before Booking Your Wedding Photography",
    telugu:
      "Photographyని book చేసుకునే ముందు clientగా తెలుసుకోవాల్సిన ముఖ్యమైన విషయాలు.",
  },
];

const LINKS = [
  {
    label: "Instagram",
    handle: "@kamakshi_cinema_photography_",
    href: "https://www.instagram.com/kamakshi_cinema_photography_/",
  },
  {
    label: "YouTube",
    handle: "Kamakshi Cinema Photography",
    href: "https://www.youtube.com/channel/UCV7EmcbAaxnVrC_nMOPCFlg",
  },
  {
    label: "Google Reviews",
    handle: "Read what our clients say",
    href: "https://g.co/kgs/QfFt37y",
  },
];

const justlogo = "/justlogo.png";

function WhyChoose() {
  return (
    <section id="why" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:py-32 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
      <div className="flex flex-col items-start gap-6 lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Why clients choose
          <br />
          Kamakshi.
        </h2>
        <p lang="te" className="font-telugu text-lg leading-relaxed text-muted-foreground">
          ప్రతి ఈవెంట్ కొన్ని గంటలు మాత్రమే జరుగుతుంది. కానీ ఆ రోజు జ్ఞాపకాలు జీవితాంతం మీతో ఉంటాయి.
        </p>
        <p className="text-pretty text-muted-foreground">
          అందుకే మేము కేవలం ఫోటోలు మరియు వీడియోలు తీయడం మాత్రమే కాదు — ప్రతి జ్ఞాపకాన్ని అత్యుత్తమ నాణ్యతతో భద్రపరచి అందించడానికి ప్రత్యేకమైన professional workflow ను అనుసరిస్తాము.
        </p>
      </div>
      <ul className="flex flex-col">
        {WHY.map(({ icon: Icon, title, copy }) => (
          <li
            key={title}
            className="grid grid-cols-[auto_1fr] gap-5 border-t border-border py-7 first:border-t-0 first:pt-0"
          >
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {copy}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Watch() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Before you book, watch these.
          </h2>
          <p className="text-pretty text-muted-foreground">
            Photography ఎంచుకోవడం కేవలం price లేదా camera ఆధారంగా కాకుండా, quality • experience • editing • data safety • final delivery ఆధారంగా ఎంచుకోవడం ముఖ్యం.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {WATCH.map((v) => (
            <article key={v.id} className="flex flex-col gap-4">
              <LiteYouTube id={v.id} title={v.title} />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {v.num}
                </p>
                <h3 className="font-medium text-foreground">{v.title}</h3>
                <p lang="te" className="font-telugu text-sm leading-relaxed text-muted-foreground">
                  {v.telugu}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

async function Films() {
  const films = await getHomeFilms();
  return (
    <section id="films" className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Recent wedding films.
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-6">
          {films.slice(0, 4).map((film) => (
            <div key={film.id} className="flex flex-col gap-3">
              <FilmCard src={film.src} poster={film.poster} />
              {film.title.trim() ? (
                <h3 className="text-sm font-medium text-foreground">
                  {film.title}
                </h3>
              ) : null}
              {film.description.trim() ? (
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {film.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/films"
            className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/60 hover:text-primary"
          >
            View more films
            <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

async function Gallery() {
  const frames = await getHomeGallery();
  return (
    <section id="gallery" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          From the studio feed.
        </h2>
        <a
          href={LINKS[0].href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          Follow us on Instagram
          <IconLink className="h-4 w-4" />
        </a>
      </div>
      <div className="mt-12 columns-2 gap-4 md:columns-3 [&>figure]:mb-4">
        {frames.map((frame, i) => (
          <figure key={frame.id} className="overflow-hidden rounded-xl">
            <Image
              src={frame.src}
              alt={frame.alt.trim() || `Wedding frame ${i + 1} by Kamakshi Cinema Photography`}
              width={800}
              height={1000}
              sizes="(min-width: 768px) 30vw, 45vw"
              className="h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          </figure>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/60 hover:text-primary"
        >
          View full gallery
          <IconArrow className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Promise() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
        <blockquote className="max-w-4xl font-display text-3xl leading-snug text-foreground sm:text-4xl">
          <p lang="te" className="font-telugu font-normal leading-relaxed">
            “మంచి కెమెరాలు అందరికీ ఉండొచ్చు. కానీ మంచి Workflow, Experienced Team, Professional Editing, Data Safety & Consistent Quality — ఇవే ఒక Event Outputని ప్రత్యేకంగా నిలబెడతాయి.”
          </p>
        </blockquote>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-foreground">
          Quality · Consistency · True 4K · Data Safety · Professional Workflow
        </p>
        <p lang="te" className="font-telugu text-base text-muted-foreground">
          మీ ఈవెంట్‌ను కేవలం రికార్డ్ చేయడం కాదు… జీవితాంతం గర్వంగా చూసుకునే జ్ఞాపకాలుగా మార్చడం మా బాధ్యత.
        </p>
      </div>
    </section>
  );
}

function Explore() {
  return (
    <section id="contact" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:py-32 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col items-start gap-6">
        <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Let&apos;s plan your day.
        </h2>
        <p lang="te" className="font-telugu text-lg leading-relaxed text-muted-foreground">
          మీ Wedding Memories జీవితాంతం మీతో ఉంటాయి.
        </p>
        <p className="text-pretty text-muted-foreground">
          Tell us about your wedding — where, when and how you dream it will
          feel — and we will take it from there. Dates fill fast; a message on
          WhatsApp is the quickest way to check ours.
        </p>
        <div className="flex flex-col items-start gap-3 sm:flex-row">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-white shadow-[0_8px_28px_rgba(236,30,140,0.35)] transition-transform hover:scale-[1.03]"
          >
            Book your date on WhatsApp
          </a>
          <a
            href="tel:+919500138281"
            className="rounded-full border border-border px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
          >
            +91 95001 38281
          </a>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Explore our work
        </p>
        <ul className="mt-3 flex flex-col">
          {LINKS.map(({ label, handle, href }) => (
            <li key={href} className="border-t border-border last:border-b">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 py-5"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-sm text-muted-foreground">{handle}</span>
                </span>
                <IconArrow className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 lg:col-span-2">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Find the studio
        </p>
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.7067793083356!2d79.97324707582676!3d14.444054480888791!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4cf31b3eae91b3%3A0x57d0f3445b83bc76!2sKamakshi%20Cinema%20Photography!5e0!3m2!1sen!2sin!4v1793235006059!5m2!1sen!2sin"
            title="Kamakshi Cinema Photography on Google Maps"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-[320px] w-full md:h-[400px]"
          />
        </div>
      </div>
    </section>
  );
}

const NAV = [
  { label: "Why us", href: "/#why" },
  { label: "Wedding films", href: "/#films" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

const OFFERS = [
  "Wedding Photography",
  "Cinematography",
  "Candid Photography",
  "Aerial Drone Coverage",
  "Live Streaming",
];

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1.2fr] lg:gap-16">
          <div className="flex flex-col items-start gap-4">
            <Image
              src={justlogo}
              alt="Kamakshi Cinema Photography logo"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <div className="flex flex-col gap-1.5">
              <p className="font-display text-3xl text-foreground">
                Kamakshi Cinema Photography
              </p>
              <p lang="te" className="font-telugu text-sm text-muted-foreground">
                మీ Wedding Memories జీవితాంతం మీతో ఉంటాయి.
              </p>
            </div>
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              Wedding photography and cinematography by an experienced team —
              RAW capture, in-house editing and true 4K delivery, backed by
              double data safety on every event.
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow-[0_8px_28px_rgba(236,30,140,0.35)] transition-transform hover:scale-[1.03]"
            >
              Book your date on WhatsApp
              <IconArrow className="h-4 w-4" />
            </a>
          </div>

          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Explore
              </p>
              <ul className="flex flex-col gap-2">
                {NAV.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-foreground transition-colors hover:text-primary"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                What we shoot
              </p>
              <ul className="flex flex-col gap-2">
                {OFFERS.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Get in touch
            </p>
            <a
              href="tel:+919500138281"
              className="font-display text-3xl text-foreground transition-colors hover:text-primary"
            >
              +91 95001 38281
            </a>
            <p className="max-w-xs text-sm text-muted-foreground">
              Share your event date and venue — we will walk you through dates,
              coverage and packages.
            </p>
            <ul className="mt-2 flex flex-col">
              {LINKS.map(({ label, handle, href }) => (
                <li key={href} className="border-t border-border">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 py-3"
                  >
                    <span className="flex flex-row items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {label}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {handle}
                      </span>
                    </span>
                    <IconArrow className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 Kamakshi Cinema Photography. All frames reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Capturing Moments · Creating Memories
          </p>
        </div>
      </div>
    </footer>
  );
}

export {
  WhyChoose,
  Watch,

  Films,
  Gallery,
  Promise,
  Explore,
  Footer,
};
