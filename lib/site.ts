/**
 * Single source of truth for brand + site URLs used by
 * metadata, robots, sitemap, JSON-LD schema and llms.txt.
 */
export const site = {
  url: "https://www.kamakshicinemaphotography.com",
  name: "Kamakshi Cinema Photography",
  shortName: "Kamakshi",
  tagline:
    "Wedding photography & cinematography studio in Nellore — RAW capture, in-house editing, true 4K delivery and double data backup.",
  phone: "+919500138281",
  phoneDisplay: "+91 95001 38281",
  whatsapp: "https://wa.me/919500138281",
  address: {
    street:
      "Beside Raveendrabharathi School, Fathe Khan Peta, Ramesh Reddy Nagar",
    locality: "Nellore",
    region: "Andhra Pradesh",
    postalCode: "524003",
    country: "IN",
  },
  addressLine: "Beside Raveendrabharathi School, Fathe Khan Peta, Ramesh Reddy Nagar, Nellore, Andhra Pradesh 524003",
  hours: "Open · Closes 8 pm",
  logo: "/mainlogo.png",
  logoSquare: "/justlogo.png",
  geo: { lat: 14.444054480888791, lng: 79.97324707582676 },
  socials: [
    "https://www.instagram.com/kamakshi_cinema_photography_/",
    "https://www.youtube.com/channel/UCV7EmcbAaxnVrC_nMOPCFlg",
    "https://g.co/kgs/QfFt37y",
  ],
  areaServed: [
    "Nellore, Andhra Pradesh",
    "Kavali, Andhra Pradesh",
    "Gudur, Andhra Pradesh",
    "Ongole, Andhra Pradesh",
    "Tirupati, Andhra Pradesh",
    "Naidupeta, Andhra Pradesh",
    "Andhra Pradesh",
    "Telangana",
    "Tamil Nadu",
    "Karnataka",
    "India",
  ],
  knowsAbout: [
    "Wedding photography",
    "Wedding cinematography",
    "Candid photography",
    "Aerial drone coverage",
    "Live streaming of events",
    "RAW photo workflows",
    "LOG and 10-bit video production",
    "4K colour grading",
  ],
} as const;

export const ABSOLUTE_LOGO_URL = `${site.url}${site.logo}`;
export const ABSOLUTE_LOGO_SQUARE_URL = `${site.url}${site.logoSquare}`;

/** Turns a stored src (/downloads/… or an R2/CDN URL) into an absolute URL. */
export function absoluteMediaUrl(src: string): string {
  return /^https?:\/\//i.test(src) ? src : `${site.url}${src}`;
}
