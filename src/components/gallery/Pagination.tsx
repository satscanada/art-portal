import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  query: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.tag) params.set("tag", query.tag);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/?${qs}#gallery` : "/#gallery";
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
  );

  const withEllipsis: Array<number | "…"> = [];
  pages.forEach((n, index) => {
    if (index > 0 && n - (pages[index - 1] ?? 0) > 1) withEllipsis.push("…");
    withEllipsis.push(n);
  });

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Link
        href={href(Math.max(1, page - 1))}
        className={cn(
          "rounded-full border border-line px-3 py-2 text-sm transition",
          page === 1 && "pointer-events-none opacity-40",
        )}
        aria-disabled={page === 1}
      >
        Previous
      </Link>
      {withEllipsis.map((item, index) =>
        item === "…" ? (
          <span key={`e-${index}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            className={cn(
              "min-w-10 rounded-full border px-3 py-2 text-center text-sm transition",
              item === page
                ? "border-ink bg-ink text-white"
                : "border-line hover:border-ink",
            )}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Link>
        ),
      )}
      <Link
        href={href(Math.min(totalPages, page + 1))}
        className={cn(
          "rounded-full border border-line px-3 py-2 text-sm transition",
          page === totalPages && "pointer-events-none opacity-40",
        )}
        aria-disabled={page === totalPages}
      >
        Next
      </Link>
    </nav>
  );
}
