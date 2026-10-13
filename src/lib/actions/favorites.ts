"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteAction(input: {
  artworkId: string;
  sessionId: string;
  makeFavorite: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("toggle_artwork_favorite", {
    artwork: input.artworkId,
    visitor_session: input.sessionId,
    make_favorite: input.makeFavorite,
  });

  if (error) {
    return { error: error.message };
  }

  return { count: Number(data ?? 0) };
}
