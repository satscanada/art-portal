import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-auto w-full max-w-6xl px-5 py-12 sm:px-8">
      <div className="border-t border-line pt-8 text-sm text-muted">
        <p className="display text-base text-ink">{siteConfig.name}</p>
        <p className="mt-2 max-w-xl">
          Curated works by {siteConfig.artistName}. Built as a quiet place to
          look closely, return often, and celebrate growing craft.
        </p>
      </div>
    </footer>
  );
}
