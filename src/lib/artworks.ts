import { siteConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { Artwork, ArtworkSearchRow, Tag } from "@/lib/types";

export type GalleryQuery = {
  q?: string;
  tag?: string | string[];
  page?: number;
};

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
  return { ...(artwork as unknown as Artwork), tags };
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
    sort_order: 0,
    view_count: row.view_count,
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
    .select(
      "*, artwork_tags(tags(id, name, slug))",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return withTags(data);
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

export async function getAnalyticsSummary() {
  const supabase = await createClient();

  const [{ data: artworks, error: artError }, { count, error: viewError }] =
    await Promise.all([
      supabase
        .from("artworks")
        .select("id, title, slug, view_count")
        .order("view_count", { ascending: false })
        .limit(10),
      supabase
        .from("page_views")
        .select("*", { count: "exact", head: true }),
    ]);

  if (artError) throw artError;
  if (viewError) throw viewError;

  const { data: sessions, error: sessionError } = await supabase
    .from("page_views")
    .select("session_id")
    .not("session_id", "is", null);

  if (sessionError) throw sessionError;

  const uniqueSessions = new Set(
    (sessions ?? []).map((row) => row.session_id).filter(Boolean),
  ).size;

  return {
    total_views: count ?? 0,
    unique_sessions: uniqueSessions,
    top_artworks: artworks ?? [],
  };
}
