-- Featured pins + moderated guestbook
-- Run in Supabase SQL Editor

alter table public.artworks
  add column if not exists is_featured boolean not null default false;

create index if not exists artworks_featured_idx
  on public.artworks (is_featured, sort_order desc)
  where is_featured = true and is_published = true;

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references public.artworks (id) on delete set null,
  author_name text not null,
  message text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists guestbook_approved_idx
  on public.guestbook_entries (is_approved, created_at desc);

create index if not exists guestbook_artwork_idx
  on public.guestbook_entries (artwork_id, is_approved, created_at desc);

alter table public.guestbook_entries enable row level security;

drop policy if exists "Public read approved guestbook" on public.guestbook_entries;
create policy "Public read approved guestbook"
  on public.guestbook_entries for select
  to anon, authenticated
  using (is_approved = true or auth.role() = 'authenticated');

drop policy if exists "Anyone can submit guestbook" on public.guestbook_entries;
create policy "Anyone can submit guestbook"
  on public.guestbook_entries for insert
  to anon, authenticated
  with check (
    length(trim(author_name)) between 1 and 80
    and length(trim(message)) between 2 and 1000
    and is_approved = false
  );

drop policy if exists "Admins manage guestbook" on public.guestbook_entries;
create policy "Admins manage guestbook"
  on public.guestbook_entries for all
  to authenticated
  using (true)
  with check (true);

grant select on public.guestbook_entries to anon, authenticated;
grant insert on public.guestbook_entries to anon, authenticated;
grant update, delete on public.guestbook_entries to authenticated;
