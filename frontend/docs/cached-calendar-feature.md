# React Query Pattern: Task Blueprints & Calendar Blocks

## Architecture Overview

The calendar feature uses React Query for server state management with a consistent 3-layer architecture:

```
API Layer (Pure HTTP)  →  React Query Hooks  →  Components
```

## 1. API Layer (`api/`)

Pure HTTP functions with no state management:
- `taskBlueprintsApi` - CRUD operations for task blueprints
- `blocksApi` - CRUD operations for calendar blocks

Each API module includes:
- HTTP methods (GET, POST, PUT, DELETE)
- Data transformers (API ↔ Frontend format)
- Type definitions for API responses

## 2. Query Key Factory

Hierarchical query keys for organized cache management:

```typescript
// Task Blueprints
taskBlueprintKeys = {
  all: ['taskBlueprints']
  lists: ['taskBlueprints', 'list']
  list: ['taskBlueprints', 'list', {filters}]
}

// Blocks
blockKeys = {
  all: ['blocks']
  lists: ['blocks', 'list']
  list: ['blocks', 'list', {filters}]
}
```

**Benefits:**
- Invalidate all queries: `invalidateQueries({ queryKey: keys.all })`
- Target specific queries: `queryKey: keys.list(filters)`

## 3. Query Hooks (Read Operations)

Hooks for fetching data with automatic caching:

```typescript
useTaskBlueprintsQuery(params)
useBlocksQuery(params, tags, timezone)
```

**Key Features:**
- Initial empty data to prevent loading states
- 5-minute stale time for cache freshness
- Automatic refetch on mount
- Filter-based query parameterization

## 4. Mutation Hooks (Write Operations)

Each CRUD operation has a dedicated mutation hook:

**Task Blueprints:**
- `useCreateTaskBlueprintMutation()`
- `useUpdateTaskBlueprintMutation()`
- `useDeleteTaskBlueprintMutation()`
- `useToggleTaskCompletionMutation()`
- `useReorderTasksMutation()`

**Calendar Blocks:**
- `useCreateBlockMutation(tags, timezone)`
- `useUpdateBlockMutation(tags, timezone)`
- `useDeleteBlockMutation()`

## 5. Optimistic Updates Pattern

All mutations follow a 3-phase optimistic update cycle:

### Phase 1: onMutate (Optimistic)
1. Cancel ongoing queries to prevent race conditions
2. Snapshot current cache state for rollback
3. Immediately update UI with optimistic data
4. Return context for success/error handlers

### Phase 2: onSuccess (Sync)
1. Replace optimistic data with real server response
2. Invalidate queries to trigger background refetch
3. Track analytics events

### Phase 3: onError (Rollback)
1. Restore cache from snapshot
2. User sees previous state (no broken UI)

## 6. Cache Synchronization Strategy

**Update Pattern:**
```typescript
// Update all matching queries (e.g., different date ranges)
queryClient.setQueriesData(
  { queryKey: keys.lists() },
  (old) => transform(old)
)

// Then invalidate to refetch in background
queryClient.invalidateQueries({ queryKey: keys.all })
```

**Why both setQueriesData + invalidate?**
- `setQueriesData`: Immediate UI update
- `invalidateQueries`: Background refetch ensures eventual consistency

## 7. Timezone Handling (Blocks Only)

Calendar blocks handle timezone conversion at the boundary:

```
Component (local time) → API Layer → Server (UTC)
Component (local time) ← Query Hook ← Server (UTC)
```

- `calendarBlockToApiData()`: Convert local time to UTC
- `parseLocalTimeISO()`: Convert UTC to local time

## Key Design Principles

1. **Separation of Concerns**: API layer has no React Query logic
2. **Optimistic UX**: Users see changes instantly, even on slow networks
3. **Consistency**: All queries update optimistically, then sync via invalidation
4. **Type Safety**: API types separate from frontend types with explicit transformers
5. **Granular Cache Control**: Query key factories enable precise cache targeting

## Usage Example

```typescript
// In a component
const { data: tasks } = useTaskBlueprintsQuery({ date: today })
const createTask = useCreateTaskBlueprintMutation()

// Create task - UI updates immediately, syncs in background
createTask.mutate({
  title: "New task",
  date: today,
  completed: false
})
```

The pattern ensures fast, responsive UI while maintaining data integrity with the server.
