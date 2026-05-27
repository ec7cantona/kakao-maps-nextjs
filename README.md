# kakao-maps-nextjs

Kakao Maps integration pattern for Next.js — vanilla SDK with `autoload=false`, server-side keyword search, and SSR-safe map initialization.

## Why this exists

Kakao Maps is the de facto standard map API in Korea (used by 100M+ users), but integrating it cleanly with modern Next.js (App Router, SSR, TypeScript) is poorly documented in both English and Korean. Most tutorials either:

- Use the legacy `<Script>` autoload pattern that breaks on route changes
- Expose REST API keys to the client
- Don't handle SSR safely (window is undefined errors)

This repo collects the patterns I've validated while building [Footballr](https://footballr.app), a Football Manager-inspired platform for Korean amateur football teams.

## Examples

Three production-tested patterns in [`examples/`](./examples):

### 1. [SDK Loader](./examples/01-load-sdk.ts)

Loads the Kakao Maps SDK with `autoload=false`. Handles:
- Route change race conditions
- React StrictMode double-renders
- Concurrent load requests (single-flight promise)
- SSR safety (browser-only execution)

```ts
import { loadKakaoSDK } from "./01-load-sdk";

await loadKakaoSDK(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!);
// SDK ready — use window.kakao.maps
```

### 2. [Basic Map Component](./examples/02-basic-map.tsx)

A minimal Next.js client component (`"use client"`) that renders a Kakao Map.
SSR-safe, with proper cleanup and loading states.

```tsx
<BasicMap
  center={{ lat: 37.5665, lng: 126.978 }}
  level={3}
  appKey={process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!}
/>
```

### 3. [Server-side Keyword Search](./examples/03-keyword-search.ts)

A Next.js App Router route handler that proxies Kakao's keyword search API.
Keeps your `KAKAO_REST_API_KEY` on the server, never exposed to the client.

Place at `app/api/places/search/route.ts`, then call from the client:

```ts
const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
const data = await res.json();
```

## Environment variables

```bash
# Client-side JS SDK key (safe to expose, restricted by domain in Kakao Console)
NEXT_PUBLIC_KAKAO_MAP_KEY=your_javascript_key

# Server-only REST API key (never bundle to client)
KAKAO_REST_API_KEY=your_rest_api_key
```

Get both keys from the [Kakao Developers Console](https://developers.kakao.com/).
Make sure to register your domain in the Kakao app settings under "Web platform".

## Status

Actively extracting and refining patterns from [Footballr](https://footballr.app) production code. Examples added incrementally as they prove out in production.

## License

MIT
