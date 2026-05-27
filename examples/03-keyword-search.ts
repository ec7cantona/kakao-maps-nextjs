import { NextRequest, NextResponse } from "next/server";

/**
 * Kakao Local Keyword Search — Next.js Route Handler
 *
 * Server-side proxy to Kakao's keyword search API.
 * Keeps the REST API key on the server, never exposed to the client.
 *
 * Setup:
 *   1. Set KAKAO_REST_API_KEY in your .env (server-only, no NEXT_PUBLIC_ prefix)
 *   2. Place this file at app/api/places/search/route.ts in your Next.js project
 *   3. Call from client:
 *
 *      const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
 *      const data = await res.json();
 *
 * Returns Kakao's keyword search response shape:
 *   { documents: Array<{ place_name, address_name, x, y, ... }>, meta: {...} }
 *
 * Reference: https://developers.kakao.com/docs/latest/en/local/dev-guide
 */

const KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

export async function GET(request: NextRequest) {
  const restApiKey = process.env.KAKAO_REST_API_KEY;

  if (!restApiKey) {
    return NextResponse.json(
      { error: "KAKAO_REST_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  // Optional pagination & sorting
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "15";

  const kakaoUrl = new URL(KAKAO_KEYWORD_URL);
  kakaoUrl.searchParams.set("query", query);
  kakaoUrl.searchParams.set("page", page);
  kakaoUrl.searchParams.set("size", size);

  try {
    const response = await fetch(kakaoUrl.toString(), {
      headers: {
        Authorization: `KakaoAK ${restApiKey}`,
      },
      // Edge-friendly: no caching of user-specific search results by default
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: "Kakao API error", status: response.status, detail: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[kakao-search] Fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to reach Kakao API" },
      { status: 502 }
    );
  }
}
