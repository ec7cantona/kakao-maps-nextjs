/**
 * Kakao Maps SDK Loader
 *
 * Loads the Kakao Maps JavaScript SDK with autoload=false pattern.
 * This avoids race conditions on route changes and React StrictMode double-renders.
 *
 * Usage:
 *   await loadKakaoSDK(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!);
 *   window.kakao.maps.load(() => { /* init map here *\/ });
 */

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (cb: () => void) => void;
        Map: new (el: HTMLElement, opts: object) => unknown;
        Marker: new (opts: object) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        services: {
          Geocoder: new () => unknown;
          Status: { OK: string };
        };
      };
    };
  }
}

const SDK_URL_BASE = "https://dapi.kakao.com/v2/maps/sdk.js";

let loadingPromise: Promise<void> | null = null;

export function loadKakaoSDK(appKey: string): Promise<void> {
  // SDK already loaded
  if (typeof window !== "undefined" && window.kakao?.maps?.services) {
    return Promise.resolve();
  }

  // SDK script tag already injected, wait for it
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("loadKakaoSDK must be called in browser environment"));
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="dapi.kakao.com"]'
    );

    if (existing) {
      existing.addEventListener("load", () => {
        window.kakao.maps.load(() => resolve());
      });
      existing.addEventListener("error", () => {
        loadingPromise = null;
        reject(new Error("Kakao SDK script failed to load"));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `${SDK_URL_BASE}?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("Kakao SDK script failed to load"));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
}
