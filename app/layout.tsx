import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Cormorant_Garamond,
  Noto_Serif_Telugu,
} from "next/font/google";
import "./globals.css";
import { ABSOLUTE_LOGO_SQUARE_URL, site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const notoTelugu = Noto_Serif_Telugu({
  variable: "--font-noto-telugu",
  subsets: ["telugu"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Best Photography Studio in Nellore`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "best photography studio in Nellore",
    "photography studio in Nellore",
    "wedding photographer Nellore",
    "wedding photography Nellore",
    "candid photographer Nellore",
    "wedding cinematography Nellore",
    "drone coverage",
    "live streaming wedding",
    "pre-wedding photography",
    "wedding photographer Andhra Pradesh",
  ],
  formatDetection: { telephone: true, address: false, email: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    alternateLocale: ["te_IN"],
    url: site.url,
    title: `${site.name} — Best Photography Studio in Nellore`,
    description: site.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Best Photography Studio in Nellore`,
    description: site.tagline,
  },
  icons: { icon: "/justlogo.png" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  colorScheme: "light",
};

/** Server-rendered entity graph: who we are + what site this is, for search and AI engines. */
function SiteGraph() {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "PhotographyBusiness",
              "@id": `${site.url}/#organization`,
              name: site.name,
              url: site.url,
              logo: ABSOLUTE_LOGO_SQUARE_URL,
              image: ABSOLUTE_LOGO_SQUARE_URL,
              description: site.tagline,
              telephone: site.phone,
              address: {
                "@type": "PostalAddress",
                streetAddress: site.address.street,
                addressLocality: site.address.locality,
                addressRegion: site.address.region,
                postalCode: site.address.postalCode,
                addressCountry: site.address.country,
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: site.geo.lat,
                longitude: site.geo.lng,
              },
              areaServed: site.areaServed.map((area) => ({
                "@type": "AdministrativeArea",
                name: area,
              })),
              sameAs: site.socials,
              knowsAbout: [...site.knowsAbout],
              makesOffer: [
                "Wedding Photography",
                "Cinematography",
                "Candid Photography",
                "Aerial Drone Coverage",
                "Live Streaming",
              ].map((name) => ({
                "@type": "Offer",
                name,
                offeredBy: { "@id": `${site.url}/#organization` },
              })),
            },
            {
              "@type": "WebSite",
              "@id": `${site.url}/#website`,
              url: site.url,
              name: site.name,
              description: site.tagline,
              publisher: { "@id": `${site.url}/#organization` },
              inLanguage: "en-IN",
            },
          ],
        }),
      }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${notoTelugu.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteGraph />
        {children}
      </body>
    </html>
  );
}
