# Data Prefetch Pattern

## Overview
Tags and other essential data are automatically prefetched when users authenticate, ensuring immediate availability across the app without loading delays.

## Problem
- Global React Query config: `refetchOnMount: false`
- Components fetch data lazily on mount
- Users see empty states or loading delays on page navigation

## Solution
**Prefetch on Authentication** - Populate React Query cache before pages render.

## Architecture

```
User Logs In
    ↓
UserContext (detects SIGNED_IN)
    ↓
AppLayoutInner (user && !isLoading)
    ↓
usePrefetchEssentialData()
    ↓
queryClient.prefetchQuery(['tags']) ← Fetches from API
    ↓
React Query Cache Populated
    ↓
Pages Render
    ↓
useTagsQuery() ← Reads from cache (instant)
```

## Key Files
- **`/src/hooks/usePrefetchEssentialData.ts`** - Prefetch hook using `queryClient.prefetchQuery()`
- **`/src/app/app/layout.tsx`** - Triggers prefetch after authentication
- **`/src/hooks/useTags.ts`** - Consumes cached data via `useTagsQuery()`

## Benefits
- ✅ Single API call per session
- ✅ Instant data availability on all pages
- ✅ No redundant fetches on navigation
- ✅ Extensible for other essential data (projects, preferences)

## Extending the Pattern
Add more data to prefetch hook:
```typescript
await queryClient.prefetchQuery({ queryKey: ['projects'], ... });
await queryClient.prefetchQuery({ queryKey: ['preferences'], ... });
```
