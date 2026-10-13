"use client";

import { useEffect } from "react";
import { trackView } from "@/lib/actions/views";
import { getVisitorSessionId } from "@/lib/session";

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
      sessionId: getVisitorSessionId(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
    });
  }, [path, artworkId]);

  return null;
}
