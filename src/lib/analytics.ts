import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";

export type PublicSiteStats = {
  total_views: number;
  unique_visitors: number;
};

export type DailyBucket = {
  date: string;
  label: string;
  views: number;
  visitors: number;
};

export type AnalyticsDashboard = PublicSiteStats & {
  views_today: number;
  views_week: number;
  gallery_views: number;
  artwork_views: number;
  mobile_share: number;
  top_artworks: Array<{
    id: string;
    title: string;
    slug: string;
    view_count: number;
  }>;
  top_referrers: Array<{ source: string; count: number }>;
  daily: DailyBucket[];
};

type ViewRow = {
  created_at: string;
  path: string;
  session_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  artwork_id: string | null;
};

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

function referrerLabel(referrer: string | null) {
  if (!referrer) return "Direct / unknown";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host || "Direct / unknown";
  } catch {
    return "Direct / unknown";
  }
}

function isMobileUa(ua: string | null) {
  if (!ua) return false;
  return /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
}

async function getClient() {
  if (hasServiceRole()) return createAdminClient();
  return createClient();
}

export async function getPublicSiteStats(): Promise<PublicSiteStats> {
  await connection();
  try {
    const supabase = await getClient();

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_site_stats",
    );
    if (!rpcError && rpcData) {
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      return {
        total_views: Number(row?.total_views ?? 0),
        unique_visitors: Number(row?.unique_visitors ?? 0),
      };
    }

    const [{ count }, { data: sessions }] = await Promise.all([
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase
        .from("page_views")
        .select("session_id")
        .not("session_id", "is", null)
        .limit(20000),
    ]);

    return {
      total_views: count ?? 0,
      unique_visitors: new Set(
        (sessions ?? []).map((row) => row.session_id).filter(Boolean),
      ).size,
    };
  } catch {
    return { total_views: 0, unique_visitors: 0 };
  }
}

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  await connection();
  const supabase = await getClient();
  const since = daysAgo(13);
  const today = startOfDay();
  const week = daysAgo(6);

  const [{ data: recentViews }, { data: topArtworks }, publicStats] =
    await Promise.all([
      supabase
        .from("page_views")
        .select("created_at, path, session_id, referrer, user_agent, artwork_id")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true })
        .limit(20000),
      supabase
        .from("artworks")
        .select("id, title, slug, view_count")
        .order("view_count", { ascending: false })
        .limit(10),
      getPublicSiteStats(),
    ]);

  const rows = (recentViews ?? []) as ViewRow[];

  let viewsToday = 0;
  let viewsWeek = 0;
  let galleryViews = 0;
  let artworkViews = 0;
  let mobileViews = 0;

  const dayMap = new Map<string, { views: number; sessions: Set<string> }>();
  for (let i = 13; i >= 0; i -= 1) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { views: 0, sessions: new Set() });
  }

  const referrerMap = new Map<string, number>();

  for (const row of rows) {
    const created = new Date(row.created_at);
    const key = created.toISOString().slice(0, 10);
    const bucket = dayMap.get(key);
    if (bucket) {
      bucket.views += 1;
      if (row.session_id) bucket.sessions.add(row.session_id);
    }

    if (created >= today) viewsToday += 1;
    if (created >= week) viewsWeek += 1;

    if (row.artwork_id || row.path.startsWith("/artwork/")) artworkViews += 1;
    else galleryViews += 1;

    if (isMobileUa(row.user_agent)) mobileViews += 1;

    const source = referrerLabel(row.referrer);
    referrerMap.set(source, (referrerMap.get(source) ?? 0) + 1);
  }

  const daily: DailyBucket[] = [...dayMap.entries()].map(([date, value]) => ({
    date,
    label: new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    views: value.views,
    visitors: value.sessions.size,
  }));

  const topReferrers = [...referrerMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    ...publicStats,
    views_today: viewsToday,
    views_week: viewsWeek,
    gallery_views: galleryViews,
    artwork_views: artworkViews,
    mobile_share: rows.length
      ? Math.round((mobileViews / rows.length) * 100)
      : 0,
    top_artworks: topArtworks ?? [],
    top_referrers: topReferrers,
    daily,
  };
}
