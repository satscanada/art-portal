"use client";

import { useEffect } from "react";
import { trackView } from "@/lib/actions/views";

const SESSION_KEY = "artportal_session";

function getSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return null;
  }
}

export function ViewTracker({
  path,
  artworkId,
}: {
  path: string;
  artworkId?: string;
}) {
  useEffect(() => {
    const key = `viewed:${path}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    void trackView({
      path,
      artworkId,
      sessionId: getSessionId(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
    });
  }, [path, artworkId]);

  return null;
}
