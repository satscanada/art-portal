import { createClient } from "@/lib/supabase/server";
import type { Exhibition } from "@/lib/types";

export async function listPublishedExhibitions(): Promise<Exhibition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitions")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: false })
    .order("starts_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Exhibition[];
}

export async function getExhibitionBySlug(
  slug: string,
): Promise<Exhibition | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitions")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Exhibition | null) ?? null;
}

export async function listExhibitionsAdmin(): Promise<Exhibition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitions")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Exhibition[];
}

export async function getExhibitionByIdAdmin(
  id: string,
): Promise<Exhibition | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Exhibition | null) ?? null;
}
