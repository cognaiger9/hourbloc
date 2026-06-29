**Before any message, opening with "Dear boss"**

## Project Goal

**HourBloc** is a time-blocking and time-tracking app that helps users plan their day, track actual time spent, and review time usage through analytics.


## Directory Structure

```
hourbloc/
├── backend/       # FastAPI Python API
├── frontend/      # Next.js web app
└── docs/          # Feature documentation and conventions
```

## Sub-project context
- Backend conventions: see `backend/AGENTS.md`
- Frontend conventions: see `frontend/AGENTS.md`

## Feature Documentation

Read the relevant doc before touching the corresponding area:

| Doc | Read when... |
|---|---|
| [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) | Working on datetime handling, timezone logic, UTC storage, or display formatting |
| [`docs/features/calendar_planning.md`](docs/features/calendar_planning.md) | Working on the calendar planning view, time block placement, or drag-and-drop interactions |
| [`docs/features/focus_timer.md`](docs/features/focus_timer.md) | Working on the focus timer feature or active block tracking |
| [`docs/features/review_block.md`](docs/features/review_block.md) | Working on the review blocks feature |
| [`docs/features/analytic.md`](docs/features/analytic.md) | Working on analytics (day/week/year views), charts, or the analytics caching pattern |
| [`frontend/docs/ARCHITECTURE_PATTERNS.md`](frontend/docs/ARCHITECTURE_PATTERNS.md) | Working on data fetching patterns, caching, or architecture decisions |

## Tech Stack
- **Backend**: FastAPI, Python.
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4.
- **State**: Zustand for app logic state. React Context only for infrastructure concerns (auth, user management, theming).
- **Data fetching**: TanStack React Query.
- **Database**: Supabase (use Supabase Python Client for connecting to DB instead of SQLAlchemy)
- **Payments**: Polar.sh (via `@polar-sh/nextjs` on frontend, Polar SDK on backend)


## Workflow Rules - NON-NEGOTIABLE
- **Never create git commits.** The user commits manually - do not run `git commit` under any circumstance.
- **Before implementing any feature, explain your plan and wait for confirmation.**
- **Never implement features that haven't been explicitly requested.**
- **Every non-trivial top-level function MUST start with a short docstring/comment explaining its high-level intent** (what it does and why), not its line-by-line mechanics. "Non-trivial" = does more than one DB call, branches on business rules, or composes multiple helpers. Pure getters, one-liners, and obvious helpers do not need one.
- **When working with external system, API (like Supabase, payment system), get the current version and fetch the document first, don't blindly apply what you've remembered**
- **Never use em-dashes (—) or en-dashes (–) in any text - UI copy, comments, or docs. Use a plain hyphen (-) only.**
