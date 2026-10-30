"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { WHATSAPP } from "@/lib/contact";

const NAV = [
  { label: "Why us", href: "/#why" },
  { label: "Films", href: "/films" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-border/70 bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-background/90 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Kamakshi Cinema Photography — home" className="w-fit">
          <Image
            src="/mainlogo.png"
            alt="Kamakshi Cinema Photography"
            width={72}
            height={48}
            priority
            className="h-11 w-auto object-contain"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_rgba(236,30,140,0.35)] transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            Book your date
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              aria-hidden
            >
              {open ? (
                <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" />
              ) : (
                <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <motion.nav
          aria-label="Mobile"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border/70 bg-background/95 px-6 py-4 backdrop-blur-md md:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map(({ label, href }) => (
              <li key={href} className="border-b border-border/50 last:border-b-0">
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow-[0_4px_20px_rgba(236,30,140,0.35)]"
          >
            Book your date on WhatsApp
          </a>
        </motion.nav>
      ) : null}
    </header>
  );
}
