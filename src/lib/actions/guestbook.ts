"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const entrySchema = z.object({
  author_name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(2).max(1000),
  artwork_id: z.string().uuid().optional().nullable(),
});

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/admin/login");
  return supabase;
}

export async function submitGuestbookAction(formData: FormData) {
  const supabase = await createClient();
  const parsed = entrySchema.safeParse({
    author_name: formData.get("author_name"),
    message: formData.get("message"),
    artwork_id: formData.get("artwork_id") || null,
  });

  if (!parsed.success) {
    return { error: "Please enter your name and a short message." };
  }

  const { error } = await supabase.from("guestbook_entries").insert({
    author_name: parsed.data.author_name,
    message: parsed.data.message,
    artwork_id: parsed.data.artwork_id,
    is_approved: false,
  });

  if (error) {
    return { error: error.message };
  }

  return { ok: true as const };
}

export async function approveGuestbookAction(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase
    .from("guestbook_entries")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/guestbook");
  revalidatePath("/guestbook");
  revalidatePath("/");
}

export async function deleteGuestbookAction(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase
    .from("guestbook_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/guestbook");
  revalidatePath("/guestbook");
}
