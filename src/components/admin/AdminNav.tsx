import Link from "next/link";
import { logoutAction } from "@/lib/actions/admin";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/artworks", label: "Artworks" },
  { href: "/admin/artworks/new", label: "Upload" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/guestbook", label: "Guestbook" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm transition hover:border-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-full border border-line px-3 py-1.5 text-sm text-muted transition hover:border-ink hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
