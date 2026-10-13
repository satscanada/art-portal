"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackView(input: {
  path: string;
  artworkId?: string | null;
  sessionId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("page_views").insert({
    path: input.path,
    artwork_id: input.artworkId ?? null,
    session_id: input.sessionId ?? null,
    referrer: input.referrer ?? null,
    user_agent: input.userAgent ?? null,
  });

  if (error) {
    console.error("trackView insert failed", error.message);
    return { ok: false as const };
  }

  if (input.artworkId) {
    await supabase.rpc("increment_artwork_views", {
      artwork: input.artworkId,
    });
  }

  return { ok: true as const };
}
