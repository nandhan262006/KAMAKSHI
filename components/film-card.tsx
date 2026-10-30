"use client";

import * as React from "react";
import { SoundToggle } from "@/components/sound-toggle";

export function FilmCard({
  src,
  poster,
}: {
  src: string;
  poster?: string | null;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const timer = React.useRef<number | undefined>(undefined);
  const ack = React.useRef<number | undefined>(undefined);
  const [muted, setMuted] = React.useState(true);
  const [soundAck, setSoundAck] = React.useState<string | null>(null);

  const showAck = (message: string) => {
    window.clearTimeout(ack.current);
    setSoundAck(message);
    ack.current = window.setTimeout(() => setSoundAck(null), 1200);
  };

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    window.clearTimeout(timer.current);
    v.muted = !v.muted;
    setMuted(v.muted);
    showAck(v.muted ? "Sound off" : "Sound on");
  };

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // Silent autoplay — sound stays off until the viewer taps the toggle.
    v.muted = true;
    v.play().catch(() => {});

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(v);
    const t = timer.current;
    const a = ack.current;
    return () => {
      io.disconnect();
      window.clearTimeout(t);
      window.clearTimeout(a);
    };
  }, []);

  const handleDoubleClick = () => {
    const v = ref.current;
    if (!v) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void v.requestFullscreen?.();
    }
  };

  return (
    <div className="relative">
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        loop
        playsInline
        preload="metadata"
        onClick={toggleSound}
        onDoubleClick={handleDoubleClick}
        className="aspect-video w-full cursor-pointer rounded-2xl border border-border bg-muted object-cover"
      />
      <SoundToggle muted={muted} onToggle={toggleSound} ack={soundAck} />
    </div>
  );
}
