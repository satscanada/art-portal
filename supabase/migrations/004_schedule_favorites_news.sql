-- Scheduled publish, favorites, exhibitions/news

alter table public.artworks
  add column if not exists scheduled_at timestamptz,
  add column if not exists favorite_count integer not null default 0;

create index if not exists artworks_scheduled_idx
  on public.artworks (is_published, scheduled_at, sort_order desc)
  where is_published = true;

create index if not exists artworks_favorites_idx
  on public.artworks (favorite_count desc)
  where is_published = true;

-- Live = published and not waiting on a future schedule
create or replace function public.artwork_is_live(a public.artworks)
returns boolean
language sql
stable
as $$
  select a.is_published
    and (a.scheduled_at is null or a.scheduled_at <= now());
$$;

create table if not exists public.artwork_favorites (
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key (artwork_id, session_id)
);

create index if not exists artwork_favorites_session_idx
  on public.artwork_favorites (session_id);

alter table public.artwork_favorites enable row level security;

drop policy if exists "Admins read favorites" on public.artwork_favorites;
create policy "Admins read favorites"
  on public.artwork_favorites for select
  to authenticated
  using (true);

create or replace function public.toggle_artwork_favorite(
  artwork uuid,
  visitor_session text,
  make_favorite boolean
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
  live boolean;
begin
  if visitor_session is null or length(trim(visitor_session)) < 8 then
    raise exception 'Invalid session';
  end if;

  select public.artwork_is_live(a.*) into live
  from public.artworks a
  where a.id = artwork;

  if coalesce(live, false) = false then
    raise exception 'Artwork not available';
  end if;

  if make_favorite then
    insert into public.artwork_favorites (artwork_id, session_id)
    values (artwork, visitor_session)
    on conflict do nothing;
  else
    delete from public.artwork_favorites
    where artwork_id = artwork and session_id = visitor_session;
  end if;

  update public.artworks a
  set favorite_count = (
    select count(*)::integer from public.artwork_favorites f where f.artwork_id = artwork
  )
  where a.id = artwork
  returning a.favorite_count into new_count;

  return new_count;
end;
$$;

grant execute on function public.toggle_artwork_favorite(uuid, text, boolean)
  to anon, authenticated;

-- Update public read: hide future-scheduled from anon; admins still see all
drop policy if exists "Public read published artworks" on public.artworks;
create policy "Public read published artworks"
  on public.artworks for select
  to anon, authenticated
  using (
    auth.role() = 'authenticated'
    or (
      is_published = true
      and (scheduled_at is null or scheduled_at <= now())
    )
  );

create or replace function public.increment_artwork_views(artwork uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.artworks a
  set view_count = view_count + 1
  where a.id = artwork
    and public.artwork_is_live(a);
end;
$$;

-- Search only live works; include favorite_count
drop function if exists public.search_artworks(text, text[], integer, integer);

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
  favorite_count integer,
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
    where public.artwork_is_live(a)
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
    f.favorite_count,
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

-- Exhibitions / news
create table if not exists public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  body text not null default '',
  location text,
  starts_on date,
  ends_on date,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exhibitions_published_idx
  on public.exhibitions (is_published, sort_order desc, starts_on desc nulls last);

drop trigger if exists exhibitions_set_updated_at on public.exhibitions;
create trigger exhibitions_set_updated_at
  before update on public.exhibitions
  for each row execute function public.set_updated_at();

alter table public.exhibitions enable row level security;

drop policy if exists "Public read published exhibitions" on public.exhibitions;
create policy "Public read published exhibitions"
  on public.exhibitions for select
  to anon, authenticated
  using (is_published = true or auth.role() = 'authenticated');

drop policy if exists "Admins manage exhibitions" on public.exhibitions;
create policy "Admins manage exhibitions"
  on public.exhibitions for all
  to authenticated
  using (true)
  with check (true);

grant select on public.exhibitions to anon, authenticated;
grant insert, update, delete on public.exhibitions to authenticated;
grant select on public.artwork_favorites to authenticated;
