"use client";

import React from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  description: React.ReactNode;
  ctaText: string;
  ctaSecondary?: React.ReactNode;
  belowCta?: React.ReactNode;
  href: string;
  logo?: React.ReactNode;
  images: string[];
  className?: string;
}

const ActionButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="rounded-full bg-primary px-8 py-3.5 font-medium text-white shadow-[0_8px_28px_rgba(236,30,140,0.4)] transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
  >
    {children}
  </motion.a>
);

export function AnimatedMarqueeHero({
  description,
  ctaText,
  ctaSecondary,
  belowCta,
  href,
  logo,
  images,
  className,
}: AnimatedMarqueeHeroProps) {
  const reduced = useReducedMotion();

  const FADE_IN_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const MARQUEE_TRANSITION: Transition = reduced
    ? { duration: 0 }
    : { ease: "linear", duration: 60, repeat: Infinity };

  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        "relative flex h-[100svh] w-full flex-col overflow-hidden bg-background",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-1 px-6 pt-6 text-center">
        {logo}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Capturing Moments.
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { delay: 0.4 } },
          }}
          className="font-display text-3xl font-bold leading-[1.1] tracking-tighter text-primary sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Creating Memories.
        </motion.p>

        <motion.p
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.55, type: "spring", stiffness: 100, damping: 20 },
            },
          }}
          className="mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.6, type: "spring", stiffness: 100, damping: 20 },
            },
          }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <ActionButton href={href}>{ctaText}</ActionButton>
          {ctaSecondary}
        </motion.div>
        {belowCta}
      </div>

      <div className="h-[30vh] w-full shrink-0 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_80%,transparent)]">
        <motion.div
          className="flex h-full w-full items-center gap-4"
          animate={{ x: reduced ? "0%" : ["0%", "-50%"] }}
          transition={MARQUEE_TRANSITION}
        >
          {duplicatedImages.map((src, index) => (
            <motion.div
              key={index}
              className="relative aspect-[3/4] h-36 shrink-0 overflow-hidden rounded-2xl shadow-[0_8px_28px_rgba(26,21,24,0.12)] sm:h-40 md:h-48"
              style={{ rotate: `${index % 2 === 0 ? -2 : 3}deg` }}
            >
              <Image
                src={src}
                alt={`Wedding frame ${index + 1} by Kamakshi Cinema Photography`}
                fill
                priority={index < 8}
                sizes="(min-width: 768px) 18rem, 10rem"
                className="object-cover"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default AnimatedMarqueeHero;
