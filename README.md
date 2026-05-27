# kakao-maps-nextjs

Kakao Maps integration pattern for Next.js — vanilla SDK with `autoload=false`, server-side keyword search, and SSR-safe map initialization.

## Why this exists

Kakao Maps is the de facto standard map API in Korea (used by 100M+ users), but integrating it cleanly with modern Next.js (App Router, SSR, TypeScript) is poorly documented in both English and Korean. Most tutorials either:

- Use the legacy `<Script>` autoload pattern that breaks on route changes
- Expose REST API keys to the client
- Don't handle SSR safely (window is undefined errors)

This repo collects the patterns I've validated while building [Footballr](https://footballr.app), a Football Manager-inspired platform for Korean amateur football teams.

## Patterns covered

### 1. Vanilla SDK with `autoload=false`

Load the SDK once, initialize maps on demand. Survives route changes and React StrictMode double-renders.

```ts
const script = document.createElement('script')
script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false&libraries=services`
script.onload = () => {
  window.kakao.maps.load(() => {
    // map initialization here
  })
}
```

### 2. Server-side keyword search

Keep the REST API key on the server. Client calls a Next.js route handler, which proxies to Kakao's `/v2/local/search/keyword.json`.

```
NEXT_PUBLIC_KAKAO_MAP_KEY    → client-side JS SDK key (safe to expose)
KAKAO_REST_API_KEY            → server-only, never in client bundle
```

### 3. SSR-safe map initialization

Guard all `window.kakao` access with `typeof window !== 'undefined'` and only mount in `useEffect`.

## Status

Actively extracting and refining patterns from [Footballr](https://footballr.app) production code. Examples added incrementally as they prove out in production.

## License

MIT
