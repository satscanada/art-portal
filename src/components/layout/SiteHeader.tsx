import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="page-shell relative z-20 flex items-start justify-between gap-4 py-5 sm:items-center sm:py-6">
      <Link href="/" className="group min-w-0">
        <p className="display text-[1.35rem] leading-tight font-semibold tracking-tight text-ink sm:text-3xl">
          {siteConfig.name}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted transition group-hover:text-accent sm:text-xs sm:tracking-[0.22em]">
          {siteConfig.artistName}
        </p>
      </Link>
      <nav className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-1 sm:pt-0">
        <Link
          href="/#gallery"
          className="rounded-full border border-line bg-surface px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink sm:text-sm"
        >
          Gallery
        </Link>
        <Link
          href="/news"
          className="rounded-full border border-line bg-surface px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink sm:text-sm"
        >
          News
        </Link>
        <Link
          href="/guestbook"
          className="rounded-full border border-line bg-surface px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink sm:text-sm"
        >
          Guestbook
        </Link>
      </nav>
    </header>
  );
}
