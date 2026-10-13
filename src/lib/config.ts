export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Atelier",
  artistName: process.env.NEXT_PUBLIC_ARTIST_NAME ?? "Young Artist",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE ??
    "A living gallery of color, curiosity, and craft",
  pageSize: Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? 12),
};

export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}

export function getSupabaseAnonKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return key;
}

export function getPublicImageUrl(path: string) {
  const base = getSupabaseUrl().replace(/\/$/, "");
  return `${base}/storage/v1/object/public/artworks/${path}`;
}
