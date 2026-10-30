"use client";

import { cn } from "@/lib/utils";

function SoundOnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6.4a8.5 8.5 0 0 1 0 11.2" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      <path d="m16 9 5 5m0-5-5 5" />
    </svg>
  );
}

export function SoundToggle({
  muted,
  onToggle,
  ack,
  className,
}: {
  muted: boolean;
  onToggle: () => void;
  ack: string | null;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      className={cn("absolute left-3 top-3 z-10 flex items-center gap-2", className)}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white backdrop transition-all duration-300",
          ack && "scale-110 bg-black/85",
        )}
      >
        {muted ? <SoundOffIcon /> : <SoundOnIcon />}
      </span>
      <span
        aria-live="polite"
        className={cn(
          "rounded-full bg-black/75 px-3 py-1 text-xs font-medium text-white transition-opacity duration-300",
          ack ? "opacity-100" : "opacity-0",
        )}
      >
        {ack ?? "\u00a0"}
      </span>
    </button>
  );
}
