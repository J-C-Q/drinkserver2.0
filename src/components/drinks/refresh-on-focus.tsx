"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Re-fetches the server-rendered page when the tab becomes visible again, so
// stock changed by other people's purchases shows up.
export const RefreshOnFocus = () => {
  const router = useRouter();
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);
  return null;
};
