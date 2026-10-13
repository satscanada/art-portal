import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
      <Link href="/" className="group">
        <p className="display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {siteConfig.name}
        </p>
        <p className="mt-0.5 text-xs uppercase tracking-[0.22em] text-muted transition group-hover:text-accent">
          {siteConfig.artistName}
        </p>
      </Link>
      <nav className="flex items-center gap-5 text-sm text-muted">
        <Link href="/#gallery" className="transition hover:text-ink">
          Gallery
        </Link>
        <Link href="/admin" className="transition hover:text-ink">
          Admin
        </Link>
      </nav>
    </header>
  );
}
