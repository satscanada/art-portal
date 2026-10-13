"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageZoom({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const close = useCallback(() => {
    setOpen(false);
    setScale(1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "+" || event.key === "=") setScale((s) => Math.min(4, s + 0.25));
      if (event.key === "-") setScale((s) => Math.max(1, s - 0.25));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="gallery-frame group relative block w-full overflow-hidden rounded-[1.6rem] p-3 text-left"
        aria-label={`Open zoom view for ${alt}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-[#d7dee4] sm:aspect-[5/6]">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="hero-media object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        </div>
        <span className="pointer-events-none absolute bottom-6 right-6 rounded-full bg-ink/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white opacity-0 transition group-hover:opacity-100">
          Click to zoom
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#0b1218]/92 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed view of ${alt}`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-4 text-white sm:px-6">
            <p className="display truncate text-lg">{alt}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-white/20 p-2 hover:bg-white/10"
                onClick={() => setScale((s) => Math.max(1, s - 0.25))}
                aria-label="Zoom out"
              >
                <Minus className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 p-2 hover:bg-white/10"
                onClick={() => setScale(1)}
                aria-label="Reset zoom"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 p-2 hover:bg-white/10"
                onClick={() => setScale((s) => Math.min(4, s + 0.25))}
                aria-label="Zoom in"
              >
                <Plus className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 p-2 hover:bg-white/10"
                onClick={close}
                aria-label="Close zoom"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="relative flex-1 overflow-auto">
            <div
              className={cn(
                "flex min-h-full min-w-full items-center justify-center p-4 transition-transform duration-200",
              )}
              style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                width={width ?? undefined}
                height={height ?? undefined}
                className="max-h-[82vh] max-w-[92vw] object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
