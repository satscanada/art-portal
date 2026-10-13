import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatCount(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function isArtworkLive(artwork: {
  is_published: boolean;
  scheduled_at?: string | null;
}) {
  if (!artwork.is_published) return false;
  if (!artwork.scheduled_at) return true;
  return new Date(artwork.scheduled_at).getTime() <= Date.now();
}

export function toDatetimeLocalValue(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function formatExhibitionDates(
  startsOn?: string | null,
  endsOn?: string | null,
) {
  const fmt = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (startsOn && endsOn && startsOn !== endsOn) {
    return `${fmt(startsOn)} – ${fmt(endsOn)}`;
  }
  if (startsOn) return fmt(startsOn);
  if (endsOn) return fmt(endsOn);
  return null;
}
