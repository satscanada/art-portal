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
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-xl flex-col gap-2 sm:relative sm:block"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search titles, captions, tags…"
          className="w-full rounded-full border border-line bg-surface-strong/90 py-3.5 pl-11 pr-4 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-[var(--glow)] sm:pr-28 sm:text-sm"
          aria-label="Search artworks"
          enterKeyHint="search"
        />
        <button
          type="submit"
          disabled={pending}
          className="absolute right-1.5 top-1/2 hidden min-h-10 -translate-y-1/2 rounded-full bg-ink px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#fff] transition hover:bg-accent disabled:opacity-60 sm:inline-flex sm:items-center"
        >
          {pending ? "…" : "Search"}
        </button>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#fff] transition hover:bg-accent disabled:opacity-60 sm:hidden"
      >
        {pending ? "Searching…" : "Search gallery"}
      </button>
    </form>
  );
}
