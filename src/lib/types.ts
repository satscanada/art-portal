export type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

export type Artwork = {
  id: string;
  title: string;
  caption: string;
  slug: string;
  image_path: string;
  thumbnail_path: string | null;
  medium: string | null;
  year: number | null;
  width_px: number | null;
  height_px: number | null;
  is_published: boolean;
  sort_order: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
};

export type ArtworkSearchRow = {
  id: string;
  title: string;
  caption: string;
  slug: string;
  image_path: string;
  thumbnail_path: string | null;
  medium: string | null;
  year: number | null;
  width_px: number | null;
  height_px: number | null;
  view_count: number;
  created_at: string;
  rank: number;
  total_count: number;
};

export type PageViewStats = {
  total_views: number;
  unique_sessions: number;
  top_artworks: Array<{
    id: string;
    title: string;
    slug: string;
    view_count: number;
  }>;
};
