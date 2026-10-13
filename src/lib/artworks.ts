import { siteConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { Artwork, ArtworkSearchRow, Tag } from "@/lib/types";
import { isArtworkLive } from "@/lib/utils";

export type GalleryQuery = {
  q?: string;
  tag?: string | string[];
  page?: number;
};

const LIVE_FILTER = "scheduled_at.is.null,scheduled_at.lte.";

function liveScheduledFilter() {
  return `${LIVE_FILTER}${new Date().toISOString()}`;
}

function normalizeTags(tag?: string | string[]) {
  if (!tag) return [] as string[];
  return (Array.isArray(tag) ? tag : [tag])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function withTags(
  row: Record<string, unknown> & {
    artwork_tags?: Array<{ tags: Tag | null }>;
  },
): Artwork {
  const tags =
    row.artwork_tags
      ?.map((item) => item.tags)
      .filter((tag): tag is Tag => Boolean(tag)) ?? [];
  const artwork = { ...row };
  delete artwork.artwork_tags;
  return {
    ...(artwork as unknown as Artwork),
    scheduled_at: (artwork.scheduled_at as string | null | undefined) ?? null,
    favorite_count: Number(artwork.favorite_count ?? 0),
    is_featured: Boolean(artwork.is_featured),
    tags,
  };
}

export async function listTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug, created_at")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function searchArtworks(query: GalleryQuery) {
  const supabase = await createClient();
  const page = Math.max(1, Number(query.page ?? 1));
  const tagSlugs = normalizeTags(query.tag);
  const q = query.q?.trim() || null;

  const { data, error } = await supabase.rpc("search_artworks", {
    query: q,
    tag_slugs: tagSlugs.length ? tagSlugs : null,
    page_num: page,
    page_size: siteConfig.pageSize,
  });

  if (error) throw error;

  const rows = (data ?? []) as ArtworkSearchRow[];
  const total = rows[0]?.total_count ?? 0;
  const ids = rows.map((row) => row.id);

  const tagsByArtwork = await getTagsForArtworks(ids);

  const artworks: Artwork[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    caption: row.caption,
    slug: row.slug,
    image_path: row.image_path,
    thumbnail_path: row.thumbnail_path,
    medium: row.medium,
    year: row.year,
    width_px: row.width_px,
    height_px: row.height_px,
    is_published: true,
    is_featured: false,
    scheduled_at: null,
    sort_order: 0,
    view_count: row.view_count,
    favorite_count: row.favorite_count ?? 0,
    created_at: row.created_at,
    updated_at: row.created_at,
    tags: tagsByArtwork[row.id] ?? [],
  }));

  return {
    artworks,
    page,
    pageSize: siteConfig.pageSize,
    total: Number(total),
    totalPages: Math.max(1, Math.ceil(Number(total) / siteConfig.pageSize)),
  };
}

async function getTagsForArtworks(ids: string[]) {
  if (!ids.length) return {} as Record<string, Tag[]>;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artwork_tags")
    .select("artwork_id, tags(id, name, slug)")
    .in("artwork_id", ids);

  if (error) throw error;

  const map: Record<string, Tag[]> = {};
  for (const row of data ?? []) {
    const tag = row.tags as unknown as Tag | null;
    if (!tag) continue;
    map[row.artwork_id] ??= [];
    map[row.artwork_id].push(tag);
  }
  return map;
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select("*, artwork_tags(tags(id, name, slug))")
    .eq("slug", slug)
    .eq("is_published", true)
    .or(liveScheduledFilter())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const artwork = withTags(data);
  return isArtworkLive(artwork) ? artwork : null;
}

export async function listAllArtworksAdmin(): Promise<Artwork[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select("*, artwork_tags(tags(id, name, slug))")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => withTags(row));
}

export async function getArtworkByIdAdmin(id: string): Promise<Artwork | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select("*, artwork_tags(tags(id, name, slug))")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return withTags(data);
}

export async function listHeroArtworks(limit = 8): Promise<Artwork[]> {
  const supabase = await createClient();
  const columns =
    "id, title, caption, slug, image_path, thumbnail_path, medium, year, width_px, height_px, is_published, is_featured, scheduled_at, sort_order, view_count, favorite_count, created_at, updated_at";

  const { data: featured, error: featuredError } = await supabase
    .from("artworks")
    .select(columns)
    .eq("is_published", true)
    .eq("is_featured", true)
    .or(liveScheduledFilter())
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (featuredError) throw featuredError;

  const picked = ((featured ?? []) as Artwork[]).filter(isArtworkLive);
  if (picked.length >= limit) return picked;

  const exclude = new Set(picked.map((item) => item.id));
  const { data: recent, error: recentError } = await supabase
    .from("artworks")
    .select(columns)
    .eq("is_published", true)
    .or(liveScheduledFilter())
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (recentError) throw recentError;

  const fill = ((recent ?? []) as Artwork[])
    .filter(isArtworkLive)
    .filter((item) => !exclude.has(item.id));
  return [...picked, ...fill].slice(0, limit);
}

export async function listGalleryNav(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select(
      "id, title, slug, image_path, thumbnail_path, width_px, height_px, is_published, scheduled_at",
    )
    .eq("is_published", true)
    .or(liveScheduledFilter())
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const items = (data ?? []).filter((item) =>
    isArtworkLive({
      is_published: item.is_published,
      scheduled_at: item.scheduled_at,
    }),
  );
  const index = items.findIndex((item) => item.slug === slug);
  if (index < 0) {
    return { prev: null, next: null, index: -1, total: items.length };
  }

  return {
    prev: index > 0 ? items[index - 1] : items[items.length - 1],
    next: index < items.length - 1 ? items[index + 1] : items[0],
    index,
    total: items.length,
  };
}

export async function listTopFavorites(limit = 8): Promise<Artwork[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select(
      "id, title, caption, slug, image_path, thumbnail_path, medium, year, width_px, height_px, is_published, is_featured, scheduled_at, sort_order, view_count, favorite_count, created_at, updated_at",
    )
    .eq("is_published", true)
    .gt("favorite_count", 0)
    .order("favorite_count", { ascending: false })
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as Artwork[]).filter(isArtworkLive);
}
