import Link from "next/link";
import { Suspense } from "react";
import { VisitorCounter } from "@/components/gallery/VisitorCounter";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="page-shell mt-auto py-10 sm:py-12">
      <div className="border-t border-line pt-7 text-sm text-muted sm:pt-8">
        <p className="display text-base text-ink sm:text-lg">{siteConfig.name}</p>
        <p className="mt-2 max-w-xl leading-relaxed">
          Curated works by {siteConfig.artistName}. A quiet place to look
          closely, return often, and celebrate growing craft.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/#gallery"
            className="text-xs uppercase tracking-[0.16em] text-ink transition hover:text-accent"
          >
            Gallery
          </Link>
          <Link
            href="/news"
            className="text-xs uppercase tracking-[0.16em] text-ink transition hover:text-accent"
          >
            News
          </Link>
          <Link
            href="/guestbook"
            className="text-xs uppercase tracking-[0.16em] text-ink transition hover:text-accent"
          >
            Guestbook
          </Link>
        </div>
        <Suspense fallback={null}>
          <VisitorCounter />
        </Suspense>
      </div>
    </footer>
  );
}
