## Design System
All design tokens (colors, typography, spacing, shadows, animations) are defined in `src/app/globals.css`.

**Before any design-related task** (styling a component, choosing colors, adding animations, setting font sizes), read `src/app/globals.css` and `src/styles/tokens.css` first and use the existing tokens - never hardcode raw hex values or arbitrary sizes.

---

## Architecture — Feature-Sliced

### Folder Structure
```
public/             # Static files served at URL root (images, SVGs, fonts, favicons)
src/
├── app/            # Next.js pages/layouts + provider.tsx (mounts global providers)
├── components/     # Shared UI components (no feature-specific logic)
├── context/        # React Contexts for infrastructure concerns (auth, theming)
├── features/       # Feature modules - all feature logic lives here
│   ├── analytics/
│   ├── auth/
│   ├── backlog/
│   ├── calendar/
│   ├── focus/
│   ├── review/
│   └── weekly-goals/
│   (each feature may have: api/, components/, hooks/, types/, utils/, stores/)
├── hooks/          # Shared hooks used across features
├── lib/            # Preconfigured libraries (fetch wrappers, etc.)
├── stores/         # Global Zustand stores (app-logic state)
├── styles/         # Global CSS (animations.css, tokens.css)
├── types/          # Shared types used across features
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Feature folders | kebab-case | `features/weekly-goals/` |
| Components | PascalCase | `Button.tsx`, `CalendarBlock.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useBlocks.ts` |
| Utilities | camelCase | `formatDate.ts`, `cn.ts` |
| Types | camelCase | `block.ts`, `api.ts` |
| API routes / pages | kebab-case directories | `app/weekly-goals/page.tsx` |

### Shared Utilities & Constants

Before creating new constants or utilities, check these files first:

| File | What lives there |
|---|---|
| `src/lib/constants.ts` | App-wide magic numbers and shared constants |
| `src/lib/utils.ts` | `cn()` — Tailwind class merger (clsx + tailwind-merge) |
| `src/lib/api.ts` | `api.get/post/put/patch/delete` — shared fetch wrapper that injects the auth token header. **Keep feature-specific endpoint functions in each feature's own `api/` folder; `lib/api.ts` is infra only.** |
| `src/lib/supabase.ts` | Pre-configured Supabase client (PKCE flow) |
| `src/components/ui/ErrorMessage.tsx` | `<ErrorMessage message={...} />` — standard danger-coloured error paragraph |
| `src/hooks/useInView.ts` | `useInView<T>(threshold)` — IntersectionObserver hook for scroll animations |

---

### Data Fetching — TanStack Query v5

Provider: `src/app/QueryProvider.tsx`. Keys + invalidation map: `src/lib/queryKeys.ts`.

**Adding a mutation - two steps:**
1. Add an entry to `invalidationMap` in `queryKeys.ts` listing every query it refreshes.
2. Call `invalidate(queryClient, "mutationName")` in `onSettled`. Never call `invalidateQueries` directly.

**Exception - `useAuthedList`:** The generic list primitive calls `queryClient.invalidateQueries` directly in its `onSettled` and `reload` implementations. It is not a named mutation - forcing it through `invalidate()` would require a map entry for every list query key, adding noise without value. This exemption applies only to `useAuthedList` itself, not to callers.

**Generic list hook:** `src/hooks/useAuthedList(queryKeys.x.all, fetchFn, removeFn, opts)` - auth-guarded, optimistic remove with automatic rollback. Returns `{ items, loading, error, remove, reload }`.

---

### Where Does This File Go?

**Component:**
- Used in 1 feature? `features/[name]/components/ComponentName.tsx`
- Used in 2+ features? `components/ComponentName.tsx`
- Used on 1 page only? `app/[page]/_components/ComponentName.tsx`

**Hook:**
- Used in 1 feature? `features/[name]/hooks/useHookName.ts`
- Used in 2+ features? `hooks/useHookName.ts`

**Type:**
- Used in 1 feature? `features/[name]/types/index.ts`
- Used in 2+ features? `types/[domain].ts`

**Utility:**
- Used in 1 feature? `features/[name]/utils/utilName.ts`
- Used in 2+ features? `utils/utilName.ts`
- Library configuration? `lib/libraryName.ts`

---

### Architecture Rules
- **No cross-feature imports.** `feature1` cannot import from `feature2` and vice versa. Compose features at the app level only.
- **Unidirectional flow only:** `shared (components/hooks/lib/types/utils) → features → app`. Shared modules cannot import from features or app.
- **No barrel files.** Import files directly - no `index.ts` re-exports inside features.
- **Feature-level API.** Each feature owns its API calls in its own `api/` folder. Do not add per-endpoint feature functions to `lib/api.ts` - that file is the shared fetch wrapper only.
- **App logic state in `stores/` via Zustand.** React Context is reserved for infrastructure concerns (auth, user management, theming) only.
- **Absolute imports only.** Always use the `@/` alias (e.g. `@/features/calendar/types/block`). Never use relative paths like `../` or `./`.
