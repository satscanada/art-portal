"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/admin/login");
  }
  return supabase;
}

const artworkSchema = z.object({
  title: z.string().min(1).max(160),
  caption: z.string().max(4000).optional().default(""),
  medium: z.string().max(120).optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  is_published: z.coerce.boolean().optional().default(true),
  sort_order: z.coerce.number().int().optional().default(0),
  tag_ids: z.array(z.string().uuid()).optional().default([]),
});

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function upsertTagAction(formData: FormData) {
  const supabase = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const slug = slugify(name);
  const { error } = await supabase.from("tags").upsert(
    { name, slug },
    { onConflict: "slug" },
  );
  if (error) throw error;

  revalidatePath("/admin/tags");
  revalidatePath("/");
}

export async function deleteTagAction(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/tags");
  revalidatePath("/");
}

export async function saveArtworkAction(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "") || null;
  const imagePath = String(formData.get("image_path") ?? "");
  const tagIds = formData.getAll("tag_ids").map(String).filter(Boolean);

  const parsed = artworkSchema.parse({
    title: formData.get("title"),
    caption: formData.get("caption") ?? "",
    medium: formData.get("medium") || null,
    year: formData.get("year") || null,
    is_published: formData.get("is_published") === "on",
    sort_order: formData.get("sort_order") || 0,
    tag_ids: tagIds,
  });

  if (!imagePath && !id) {
    throw new Error("An image is required for new artworks.");
  }

  const baseSlug = slugify(parsed.title);
  const slug = id ? undefined : `${baseSlug}-${Date.now().toString(36)}`;

  const payload = {
    title: parsed.title,
    caption: parsed.caption,
    medium: parsed.medium,
    year: parsed.year,
    is_published: parsed.is_published,
    sort_order: parsed.sort_order,
    ...(imagePath ? { image_path: imagePath } : {}),
    ...(slug ? { slug } : {}),
  };

  let artworkId = id;

  if (id) {
    const { error } = await supabase
      .from("artworks")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("artworks")
      .insert(payload)
      .select("id, slug")
      .single();
    if (error) throw error;
    artworkId = data.id;
  }

  if (artworkId) {
    await supabase.from("artwork_tags").delete().eq("artwork_id", artworkId);
    if (parsed.tag_ids.length) {
      const { error } = await supabase.from("artwork_tags").insert(
        parsed.tag_ids.map((tag_id) => ({
          artwork_id: artworkId!,
          tag_id,
        })),
      );
      if (error) throw error;
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/artworks");
  if (artworkId) {
    revalidatePath(`/admin/artworks/${artworkId}`);
  }

  redirect("/admin/artworks");
}

export async function deleteArtworkAction(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  const imagePath = String(formData.get("image_path") ?? "");
  if (!id) return;

  if (imagePath) {
    await supabase.storage.from("artworks").remove([imagePath]);
  }

  const { error } = await supabase.from("artworks").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/admin/artworks");
  redirect("/admin/artworks");
}

export async function uploadArtworkImage(formData: FormData) {
  const supabase = await requireUser();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("artworks")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    return { error: error.message };
  }

  return { path };
}
