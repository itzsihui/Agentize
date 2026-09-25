"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import { merchantJsonHeaders } from "@/lib/world/client-auth";

/** Onboard banner: tells unverified merchants their store will stay unlisted. */
export function WorldListingNotice({ user }: { user: User | null }) {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/world/status", {
          headers: await merchantJsonHeaders(user),
        });
        const data = (await res.json()) as { verified?: boolean };
        if (!cancelled) setVerified(Boolean(data.verified));
      } catch {
        if (!cancelled) setVerified(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (verified !== false) return null;
  return (
    <p className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-foreground/75">
      Your storefront will publish as an unlisted draft until you{" "}
      <Link href="/merchant/setup" className="underline underline-offset-2">
        verify with World ID
      </Link>{" "}
      (one person, one storefront).
    </p>
  );
}
