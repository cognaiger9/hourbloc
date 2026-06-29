## Backend Architecture — FastAPI Project Structure

Organized by domain, not by file type.

```
backend/
├── migrations/             # SQL migration files (run manually via Supabase SQL editor)
├── src/
│   ├── block/              # Time block CRUD (/api/v1/blocks)
│   │   ├── router.py       # API endpoints
│   │   ├── schemas.py      # Pydantic models (request/response)
│   │   ├── service.py      # Business logic
│   │   ├── constants.py    # Module-specific constants
│   │   ├── exceptions.py   # Module-specific exceptions
│   │   └── utils.py        # Non-business helpers
│   ├── tag/                # Tag management (/api/v1/tags)
│   ├── analytics/          # Day/week/year analytics (/api/v1/analytics)
│   ├── weekly_goals/       # Weekly goal tracking (/api/v1/weekly-goals)
│   ├── task_blueprint/     # Task blueprint templates (/api/v1/task-blueprints)
│   ├── backlog/            # Backlog management (/api/v1/backlog)
│   ├── config.py           # Global config (env vars via python-dotenv)
│   ├── supabase.py         # Supabase client initialization
│   ├── dependencies.py     # Shared auth dependencies
│   └── exceptions.py       # Global exceptions
├── main.py                 # App factory, CORS, router mounts
├── docs/
├── requirements.txt
└── .env
```

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Feature folders | lowercase, singular | `block`, `tag`, `analytics` |
| Files | snake_case | `router.py`, `service.py` |
| Classes | PascalCase | `BlockService`, `TagResponse` |
| Functions | snake_case | `get_current_user`, `create_block` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_PAGE_SIZE` |
| Pydantic schemas | PascalCase + suffix | `BlockCreate`, `BlockResponse`, `BlockUpdate` |
| Exceptions | PascalCase + Error/Exception | `BlockNotFound`, `InvalidTokenError` |

## Backend Structure Rules

- All domain packages live inside `src/`.
- Each package owns its `router.py`, `schemas.py`, `service.py`, `constants.py`, `exceptions.py`, `utils.py`.
- Cross-package imports use explicit module names:
  ```python
  from src.block import service as block_service
  from src.tag.constants import ErrorCode as TagErrorCode
  ```
- No circular imports. `service.py` never imports from `router.py`.
- `utils.py` = non-business helpers only. Business logic goes in `service.py`.

## Where Does This Code Belong?

```
Is it an API endpoint?                          -> router.py
Is it request/response validation?              -> schemas.py
Is it business logic (rules, calculations)?     -> service.py
Is it a reusable auth/permission check?         -> dependencies.py
Is it a custom error?                           -> exceptions.py
Is it a pure helper (formatting, sorting)?      -> utils.py
Is it a configuration value?                    -> config.py
Is it a constant/enum?                          -> constants.py
Is it a DB schema change?                       -> migrations/<seq>_<description>.sql
```

## Database Migrations

Migration files live in `backend/migrations/`. Each file is a plain SQL script run manually in the Supabase SQL editor (no migration runner is used).

**Naming:** `<seq>_<description>.sql` — three-digit zero-padded sequence, snake_case description.
```
migrations/
├── 001_initial_schema.sql
├── 002_add_duration_seconds.sql
└── ...
```

**Rules:**
- Migrations are **append-only** - never edit a migration that has already been applied unless given explicit command.
- Every migration must be idempotent where practical (`create table if not exists`, `create index if not exists`, etc.) so re-runs are safe.
- Destructive operations (`drop`, `truncate`) require a comment explaining why.

## Supabase Query Safety

Always guard against `.execute()` returning `None` (can happen on network blips or client errors). Never access `.data` directly on the result without checking the response object itself first.

```python
# correct
resp = supabase_admin.table("foo").select("bar").maybe_single().execute()
value = resp.data["bar"] if resp and resp.data else default_value

# wrong - crashes with AttributeError when resp is None
value = resp.data["bar"] if resp.data else default_value
```

## API Response Design

- `schemas.py` defines only what the frontend actually reads - no extra fields. Before adding a field to a Pydantic response model, verify it is accessed in the frontend.
- Never expose internal DB columns (`updated_at`, `metadata`, foreign keys the client doesn't need) just because they exist on the row.
- Service functions that return data to the router must declare an explicit return type - never `-> dict`. Use Pydantic models for API-bound returns, `TypedDict` for internal shapes.

```python
# correct
def list_blocks(user_id: UUID) -> list[BlockResponse]: ...
def _get_raw_block(block_id: UUID) -> _BlockRow: ...  # TypedDict, private helper

# wrong
def list_blocks(user_id: UUID) -> dict: ...
```
