"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    next.delete("page");
    startTransition(() => {
      router.push(`/?${next.toString()}#gallery`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Smart search titles, captions, media, tags…"
        className="w-full rounded-full border border-line bg-surface-strong/80 py-3.5 pl-11 pr-28 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-[var(--glow)]"
        aria-label="Search artworks"
      />
      <button
        type="submit"
        disabled={pending}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-accent disabled:opacity-60"
      >
        {pending ? "…" : "Search"}
      </button>
    </form>
  );
}
