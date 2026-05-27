"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoSDK } from "./01-load-sdk";

/**
 * Basic Kakao Map Component
 *
 * A minimal Next.js client component that renders a Kakao Map.
 * Demonstrates SSR-safe initialization, cleanup, and the autoload=false pattern.
 *
 * Usage:
 *   <BasicMap
 *     center={{ lat: 37.5665, lng: 126.978 }}
 *     level={3}
 *     appKey={process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!}
 *   />
 */

interface BasicMapProps {
  center: { lat: number; lng: number };
  level?: number;
  appKey: string;
  className?: string;
}

export function BasicMap({
  center,
  level = 3,
  appKey,
  className = "w-full h-[400px]",
}: BasicMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    // SSR guard — kakao only exists in browser
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;

    let cancelled = false;

    loadKakaoSDK(appKey)
      .then(() => {
        if (cancelled) return;
        if (!containerRef.current) return;

        const latlng = new window.kakao.maps.LatLng(center.lat, center.lng);

        new window.kakao.maps.Map(containerRef.current, {
          center: latlng,
          level,
        });

        // Add a marker at the center
        new window.kakao.maps.Marker({
          position: latlng,
          map: undefined, // will be set via setMap pattern in real use
        });

        setStatus("ready");
      })
      .catch((err) => {
        console.error("[BasicMap] Failed to load Kakao SDK:", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng, level, appKey]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          Loading map...
        </div>
      )}
      {status === "error" && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "red" }}>
          Failed to load map
        </div>
      )}
    </div>
  );
}
