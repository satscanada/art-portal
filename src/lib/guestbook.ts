import { createClient } from "@/lib/supabase/server";

export type GuestbookEntry = {
  id: string;
  artwork_id: string | null;
  author_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
};

export async function listApprovedGuestbook(artworkId?: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("guestbook_entries")
    .select("id, artwork_id, author_name, message, is_approved, created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (artworkId) {
    query = query.eq("artwork_id", artworkId);
  } else {
    query = query.is("artwork_id", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as GuestbookEntry[];
}

export async function listGuestbookAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guestbook_entries")
    .select("id, artwork_id, author_name, message, is_approved, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as GuestbookEntry[];
}
