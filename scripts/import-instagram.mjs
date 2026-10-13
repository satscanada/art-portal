#!/usr/bin/env node
/**
 * Upload prepared Instagram posts from import/instagram-ready into Supabase
 * using an admin Auth user (same as /admin login).
 *
 * Usage:
 *   ADMIN_EMAIL=you@email.com ADMIN_PASSWORD='secret' node scripts/import-instagram.mjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + publishable/anon key from .env / .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const readyDir = join(root, "import", "instagram-ready");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(join(root, ".env.local"));
loadEnvFile(join(root, ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL || process.env.ADMINUSER;
const password = process.env.ADMIN_PASSWORD || process.env.ADMINPASS;

if (!url || (!anonKey && !serviceKey)) {
  console.error("Missing Supabase URL/key in .env");
  process.exit(1);
}

const manifestPath = join(readyDir, "manifest.json");
if (!existsSync(manifestPath)) {
  console.error("Missing manifest. Run prepare-instagram-posts.py first.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const usingServiceRole = Boolean(serviceKey);
const supabase = createClient(url, serviceKey || anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function ensureTag(name) {
  const slug = slugify(name);
  const { data: existing } = await supabase
    .from("tags")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("tags")
    .insert({ name, slug })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function main() {
  if (!usingServiceRole) {
    if (!email || !password) {
      console.error(
        "Set ADMINUSER/ADMINPASS, or add SUPABASE_SERVICE_ROLE_KEY to .env.",
      );
      process.exit(1);
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      console.error("Admin login failed:", authError.message);
      console.error(
        "Enable Email provider in Supabase → Authentication → Providers,",
      );
      console.error(
        "or add SUPABASE_SERVICE_ROLE_KEY from Project Settings → API.",
      );
      process.exit(1);
    }
  } else {
    console.log("Importing with service role key (bypasses Auth login).");
  }

  const files = new Set(
    readdirSync(readyDir).filter((name) => name.toLowerCase().endsWith(".jpg")),
  );

  let uploaded = 0;
  let skipped = 0;

  for (const item of manifest) {
    const filePath = join(readyDir, item.file);
    if (!files.has(item.file) || !existsSync(filePath)) {
      console.warn("Skip missing image:", item.file);
      skipped += 1;
      continue;
    }

    const bytes = readFileSync(filePath);
    const storagePath = `instagram/${Date.now()}-${randomUUID()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .upload(storagePath, bytes, {
        contentType: "image/jpeg",
        upsert: false,
      });
    if (uploadError) {
      console.error("Upload failed", item.file, uploadError.message);
      skipped += 1;
      continue;
    }

    const slug = `${slugify(item.title) || "artwork"}-${randomUUID().slice(0, 8)}`;
    const { data: artwork, error: insertError } = await supabase
      .from("artworks")
      .insert({
        title: item.title,
        caption: item.caption,
        slug,
        image_path: storagePath,
        medium: item.medium,
        year: item.year,
        is_published: true,
        sort_order: item.sort_order ?? 0,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert failed", item.file, insertError.message);
      skipped += 1;
      continue;
    }

    const tagIds = [];
    for (const tagName of item.tags || []) {
      try {
        tagIds.push(await ensureTag(tagName));
      } catch (err) {
        console.warn("Tag failed", tagName, err.message || err);
      }
    }
    if (tagIds.length) {
      await supabase.from("artwork_tags").insert(
        tagIds.map((tag_id) => ({ artwork_id: artwork.id, tag_id })),
      );
    }

    uploaded += 1;
    console.log(`✓ ${uploaded}/${manifest.length} ${item.file} → ${item.title}`);
  }

  if (!usingServiceRole) {
    await supabase.auth.signOut();
  }
  console.log(`Done. Uploaded ${uploaded}, skipped ${skipped}.`);
  console.log("Open https://lakshanvs.com and /admin/artworks to review.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
