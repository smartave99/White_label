"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Hook that detects when a new service worker version is available.
 * When a new SW is installed & waiting, it sends SKIP_WAITING so
 * the new SW activates immediately. Once the new SW takes control,
 * `updateAvailable` becomes true so the UI can prompt a reload.
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    // When a NEW service worker takes over, prompt user to reload
    const onControllerChange = () => {
      setUpdateAvailable(true);
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    // Check for waiting SW on existing registrations
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      // If there's already a waiting worker, activate it
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        return;
      }

      // Listen for new SW installing
      const onUpdateFound = () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          // When the new worker is installed and waiting, activate it
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      };

      registration.addEventListener("updatefound", onUpdateFound);
    });

    // Periodically check for updates (every 60 seconds)
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration?.update();
      });
    }, 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
      clearInterval(interval);
    };
  }, []);

  return { updateAvailable, reload };
}
