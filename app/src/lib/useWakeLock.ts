import { useEffect } from "react";

interface WakeLockSentinel {
  release(): Promise<void>;
}

/** Keep the screen awake while `active` — practice shouldn't die to the
 * phone's sleep timer. No-op where the Wake Lock API is unavailable. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request(type: "screen"): Promise<WakeLockSentinel> };
    };
    nav.wakeLock
      ?.request("screen")
      .then((s) => {
        if (cancelled) void s.release();
        else sentinel = s;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      void sentinel?.release();
    };
  }, [active]);
}
