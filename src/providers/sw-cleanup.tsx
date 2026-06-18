"use client";

import * as React from "react";

/**
 * CertPath AI does not use a service worker. If a stale one is registered on
 * this origin (common on a shared `localhost:3000` previously used by another
 * project), it can hijack navigations and produce "no-response" fetch errors.
 * This unregisters any such worker once on load.
 */
export function ServiceWorkerCleanup() {
  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      })
      .catch(() => {
        /* ignore — nothing we can do */
      });
  }, []);
  return null;
}
