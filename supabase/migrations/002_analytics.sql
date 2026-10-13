-- Public + admin analytics helpers
-- Run in Supabase SQL Editor after 001_initial.sql

create or replace function public.get_site_stats()
returns table (
  total_views bigint,
  unique_visitors bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total_views,
    count(distinct nullif(session_id, ''))::bigint as unique_visitors
  from public.page_views;
$$;

grant execute on function public.get_site_stats() to anon, authenticated;

-- Optional: allow authenticated admins to read recent analytics efficiently
create index if not exists page_views_path_created_idx
  on public.page_views (path, created_at desc);
