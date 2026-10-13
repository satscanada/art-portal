"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import { getPublicImageUrl } from "@/lib/config";
import { cn } from "@/lib/utils";

export type LightboxNeighbor = {
  slug: string;
  title: string;
  image_path: string;
  width_px?: number | null;
  height_px?: number | null;
};

export function ImageZoom({
  src,
  alt,
  width,
  height,
  prev,
  next,
  positionLabel,
}: {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  prev?: LightboxNeighbor | null;
  next?: LightboxNeighbor | null;
  positionLabel?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const close = useCallback(() => {
    setOpen(false);
    setScale(1);
  }, []);

  const go = useCallback(
    (neighbor?: LightboxNeighbor | null) => {
      if (!neighbor) return;
      setScale(1);
      router.push(`/artwork/${neighbor.slug}?zoom=1`);
    },
    [router],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("zoom") === "1") {
      setOpen(true);
      params.delete("zoom");
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "+" || event.key === "=")
        setScale((s) => Math.min(4, s + 0.25));
      if (event.key === "-") setScale((s) => Math.max(1, s - 0.25));
      if (event.key === "ArrowLeft") go(prev);
      if (event.key === "ArrowRight") go(next);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go, prev, next]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="gallery-frame group relative block w-full overflow-hidden rounded-[1.25rem] p-2.5 text-left sm:rounded-[1.6rem] sm:p-3"
        aria-label={`Open zoom view for ${alt}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-[#d7dee4] sm:aspect-[5/6] sm:rounded-[1.1rem]">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="hero-media object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        </div>
        <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-ink/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#fff] opacity-100 transition sm:bottom-6 sm:right-6 sm:opacity-0 sm:group-hover:opacity-100">
          Tap to zoom
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#0b1218]/94 pt-[env(safe-area-inset-top)] backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed view of ${alt}`}
        >
          <div className="flex items-center justify-between gap-3 px-3 py-3 text-white sm:px-6 sm:py-4">
            <div className="min-w-0 flex-1">
              <p className="display truncate text-base sm:text-lg">{alt}</p>
              {positionLabel ? (
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-white/55">
                  {positionLabel}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className="rounded-full border border-white/20 p-2.5 hover:bg-white/10"
                onClick={() => setScale((s) => Math.max(1, s - 0.25))}
                aria-label="Zoom out"
              >
                <Minus className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 p-2.5 hover:bg-white/10"
                onClick={() => setScale(1)}
                aria-label="Reset zoom"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 p-2.5 hover:bg-white/10"
                onClick={() => setScale((s) => Math.min(4, s + 0.25))}
                aria-label="Zoom in"
              >
                <Plus className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 p-2.5 hover:bg-white/10"
                onClick={close}
                aria-label="Close zoom"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center overflow-hidden pb-[env(safe-area-inset-bottom)]">
            {prev ? (
              <button
                type="button"
                onClick={() => go(prev)}
                className="absolute left-2 z-10 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur hover:bg-white/10 sm:left-4"
                aria-label={`Previous: ${prev.title}`}
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : null}

            <div className="relative flex-1 overflow-auto overscroll-contain">
              <div
                className={cn(
                  "flex min-h-full min-w-full items-center justify-center p-3 transition-transform duration-200 sm:p-4",
                )}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  width={width ?? undefined}
                  height={height ?? undefined}
                  className="max-h-[78vh] max-w-[94vw] object-contain sm:max-h-[82vh] sm:max-w-[92vw]"
                  draggable={false}
                />
              </div>
            </div>

            {next ? (
              <button
                type="button"
                onClick={() => go(next)}
                className="absolute right-2 z-10 rounded-full border border-white/20 bg-black/30 p-2.5 text-white backdrop-blur hover:bg-white/10 sm:right-4"
                aria-label={`Next: ${next.title}`}
              >
                <ChevronRight className="size-5" />
              </button>
            ) : null}
          </div>

          {(prev || next) && scale === 1 ? (
            <div className="flex justify-center gap-3 px-4 pb-4">
              {prev ? (
                <button
                  type="button"
                  onClick={() => go(prev)}
                  className="hidden max-w-[40%] truncate text-xs text-white/60 hover:text-white sm:block"
                >
                  ← {prev.title}
                </button>
              ) : null}
              {next ? (
                <button
                  type="button"
                  onClick={() => go(next)}
                  className="hidden max-w-[40%] truncate text-xs text-white/60 hover:text-white sm:block"
                >
                  {next.title} →
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Prefetch neighbor thumbs for smoother slideshow feel */}
          {prev ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getPublicImageUrl(prev.image_path)}
              alt=""
              className="pointer-events-none absolute size-0 opacity-0"
              aria-hidden
            />
          ) : null}
          {next ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getPublicImageUrl(next.image_path)}
              alt=""
              className="pointer-events-none absolute size-0 opacity-0"
              aria-hidden
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
