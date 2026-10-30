"use client";

import * as React from "react";
import { SoundToggle } from "@/components/sound-toggle";

export function PopupVideo() {
  const ref = React.useRef<HTMLVideoElement>(null);
  const ack = React.useRef<number | undefined>(undefined);
  const [open, setOpen] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [soundAck, setSoundAck] = React.useState<string | null>(null);

  const showAck = (message: string) => {
    window.clearTimeout(ack.current);
    setSoundAck(message);
    ack.current = window.setTimeout(() => setSoundAck(null), 1200);
  };

  React.useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 10000);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const v = ref.current;
    if (!open || !v) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(ack.current);
      v.pause();
      setPlaying(false);
    };
  }, [open]);

  const start = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    void v.play();
    setPlaying(true);
  };

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    showAck(v.muted ? "Sound off" : "Sound on");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Kamakshi Cinema Photography showreel"
    >
      <div className="relative flex max-h-full flex-col items-center gap-3 p-6">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close video"
          className="absolute -top-1 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black md:-right-4 md:-top-4"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="relative rounded-2xl">
          <video
            ref={ref}
            src="/popup.mp4"
            loop
            controls={playing}
            playsInline
            preload="metadata"
            className="max-h-[78vh] max-w-[86vw] rounded-2xl bg-black md:max-w-[720px]"
          />
          {playing && (
            <SoundToggle
              muted={muted}
              onToggle={toggleSound}
              ack={soundAck}
            />
          )}
          {!playing && (
            <button
              type="button"
              onClick={start}
              aria-label="Play video with sound"
              className="absolute inset-0 flex w-full items-center justify-center rounded-2xl"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-105">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-1 h-7 w-7 fill-foreground"
                  aria-hidden
                >
                  <path d="M8 5.5v13l11-6.5Z" />
                </svg>
              </span>
            </button>
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-white/80">
          Kamakshi Cinema Photography · Showreel
        </p>
      </div>
    </div>
  );
}

