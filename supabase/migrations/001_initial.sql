-- Art Portal schema: artworks, tags, views, FTS, storage RLS
-- Run in Supabase SQL Editor (or: supabase db push)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text not null default '',
  slug text not null unique,
  image_path text not null,
  thumbnail_path text,
  medium text,
  year integer,
  width_px integer,
  height_px integer,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(caption, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(medium, '')), 'C')
  ) stored
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.artwork_tags (
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (artwork_id, tag_id)
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references public.artworks (id) on delete set null,
  path text not null,
  session_id text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists artworks_published_idx
  on public.artworks (is_published, sort_order desc, created_at desc);

create index if not exists artworks_search_idx
  on public.artworks using gin (search_vector);

create index if not exists artwork_tags_tag_idx
  on public.artwork_tags (tag_id);

create index if not exists page_views_artwork_idx
  on public.page_views (artwork_id, created_at desc);

create index if not exists page_views_created_idx
  on public.page_views (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists artworks_set_updated_at on public.artworks;
create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- View counter (callable by anon)
-- ---------------------------------------------------------------------------

create or replace function public.increment_artwork_views(artwork uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.artworks
  set view_count = view_count + 1
  where id = artwork and is_published = true;
end;
$$;

grant execute on function public.increment_artwork_views(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Smart search helper
-- ---------------------------------------------------------------------------

create or replace function public.search_artworks(
  query text default null,
  tag_slugs text[] default null,
  page_num integer default 1,
  page_size integer default 12
)
returns table (
  id uuid,
  title text,
  caption text,
  slug text,
  image_path text,
  thumbnail_path text,
  medium text,
  year integer,
  width_px integer,
  height_px integer,
  view_count integer,
  created_at timestamptz,
  rank real,
  total_count bigint
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  offset_val integer := greatest(page_num - 1, 0) * page_size;
  q tsquery;
begin
  if query is not null and length(trim(query)) > 0 then
    q := plainto_tsquery('english', query);
  end if;

  return query
  with filtered as (
    select
      a.*,
      case
        when q is null then 0::real
        else ts_rank_cd(a.search_vector, q)
      end as rank
    from public.artworks a
    where a.is_published = true
      and (
        q is null
        or a.search_vector @@ q
        or a.title ilike '%' || query || '%'
        or a.caption ilike '%' || query || '%'
        or exists (
          select 1
          from public.artwork_tags at
          join public.tags t on t.id = at.tag_id
          where at.artwork_id = a.id
            and (
              t.name ilike '%' || query || '%'
              or t.slug ilike '%' || query || '%'
            )
        )
      )
      and (
        tag_slugs is null
        or cardinality(tag_slugs) = 0
        or exists (
          select 1
          from public.artwork_tags at
          join public.tags t on t.id = at.tag_id
          where at.artwork_id = a.id
            and t.slug = any (tag_slugs)
        )
      )
  ),
  counted as (
    select count(*)::bigint as total_count from filtered
  )
  select
    f.id,
    f.title,
    f.caption,
    f.slug,
    f.image_path,
    f.thumbnail_path,
    f.medium,
    f.year,
    f.width_px,
    f.height_px,
    f.view_count,
    f.created_at,
    f.rank,
    c.total_count
  from filtered f
  cross join counted c
  order by
    case when q is null then 0 else 1 end desc,
    f.rank desc,
    f.sort_order desc,
    f.created_at desc
  limit page_size
  offset offset_val;
end;
$$;

grant execute on function public.search_artworks(text, text[], integer, integer)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.artworks enable row level security;
alter table public.tags enable row level security;
alter table public.artwork_tags enable row level security;
alter table public.page_views enable row level security;

-- Public read of published art
drop policy if exists "Public read published artworks" on public.artworks;
create policy "Public read published artworks"
  on public.artworks for select
  to anon, authenticated
  using (is_published = true or auth.role() = 'authenticated');

drop policy if exists "Admins manage artworks" on public.artworks;
create policy "Admins manage artworks"
  on public.artworks for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public read tags" on public.tags;
create policy "Public read tags"
  on public.tags for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage tags" on public.tags;
create policy "Admins manage tags"
  on public.tags for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public read artwork_tags" on public.artwork_tags;
create policy "Public read artwork_tags"
  on public.artwork_tags for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage artwork_tags" on public.artwork_tags;
create policy "Admins manage artwork_tags"
  on public.artwork_tags for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Anyone can insert views" on public.page_views;
create policy "Anyone can insert views"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins read views" on public.page_views;
create policy "Admins read views"
  on public.page_views for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artworks',
  'artworks',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read artwork images" on storage.objects;
create policy "Public read artwork images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'artworks');

drop policy if exists "Admins upload artwork images" on storage.objects;
create policy "Admins upload artwork images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'artworks');

drop policy if exists "Admins update artwork images" on storage.objects;
create policy "Admins update artwork images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'artworks')
  with check (bucket_id = 'artworks');

drop policy if exists "Admins delete artwork images" on storage.objects;
create policy "Admins delete artwork images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'artworks');

-- ---------------------------------------------------------------------------
-- Grants (Data API)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.artworks, public.tags, public.artwork_tags to anon, authenticated;
grant insert, update, delete on public.artworks, public.tags, public.artwork_tags to authenticated;
grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;
