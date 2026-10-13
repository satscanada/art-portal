"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/config";

const links = [
  { href: "/#gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/guestbook", label: "Guestbook" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  return (
    <header className="page-shell relative z-30 py-5 sm:py-6">
      <div className="flex items-start justify-between gap-4 sm:items-center">
        <Link href="/" className="group min-w-0 flex-1" onClick={() => setOpen(false)}>
          <p className="display text-[1.35rem] leading-tight font-semibold tracking-tight text-ink sm:text-3xl">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted transition group-hover:text-accent sm:text-xs sm:tracking-[0.22em]">
            {siteConfig.artistName}
          </p>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-ink sm:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <nav
          id={menuId}
          className="mt-4 animate-rise overflow-hidden rounded-[1.25rem] border border-line bg-surface/95 p-2 shadow-[0_18px_40px_rgba(20,32,42,0.08)] backdrop-blur sm:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center rounded-[1rem] px-4 text-sm uppercase tracking-[0.16em] text-ink transition hover:bg-accent-soft hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
