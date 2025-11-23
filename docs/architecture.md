# Architecture & Data Flow

## System overview
GenAI Labs is a pnpm workspace with two teammates working side by side:
- **apps/web** — the Next.js App Router client that listens to the user, gathers experiment knobs, calls the API through typed helpers, and paints the results with TanStack Query state so nothing feels brittle.
- **apps/api** — the NestJS service that tidies the request, chats with OpenAI (or a mocked LLM on slow days), computes heuristics, and tucks runs into `apps/api/data/experiments.json` so we keep a paper trail.

A single `.env` (or platform secrets) keeps them on the same wavelength: `NEXT_PUBLIC_API_URL` for the client and `WEB_APP_URL` for the API’s CORS. Both share TypeScript configs and pnpm scripts to reduce busywork.

## Data flow
1. The user configures prompt, ranges, and variant counts in `apps/web/app/page.tsx`.
2. `lib/api.ts` posts the payload to `POST /experiments` with an idempotent request body (prompt, ranges, variant count, token budget).
3. `ExperimentsService` expands ranges, asks `LlmService` for each combination, and hands completions to `MetricsService` for scoring and analysis text.
4. Results are written to `experiments.json` (latest first) and returned to the client.
5. React Query invalidates `['experiments']`, refreshing the summary, response grid, and history rail without manual state wiring.

This keeps the client stateless: a refresh just asks the API what happened, and the user still sees their past experiments without any heroics.

## REST API surface
| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | GET | Returns service metadata and the status message from `AppService` for uptime checks. |
| `/experiments` | GET | Lists experiments ordered from newest to oldest for the history rail. |
| `/experiments/:id` | GET | Fetches a single experiment for deep links or QA. |
| `/experiments` | POST | Generates the parameter sweep, scores variants, persists the run, and returns the full experiment payload. |
| `/experiments/:id` | DELETE | Removes an experiment so the history can be curated without file edits. |

## Component structure (apps/web)
```
app/
  layout.tsx      # typography, metadata, providers (QueryClient, font CSS)
  page.tsx        # entire experiment workflow (form, summaries, response grid)
  providers.tsx   # isolates React providers to keep layout clean
components/
  layout/
    SiteHeader.tsx  # brand lockup + export controls + CTA link
    SiteFooter.tsx  # attribution links, project description, contact CTA
  lab/
    MetricBadge.tsx   # renders heuristic labels, score pill, tooltip copy
    ResponseCard.tsx  # shows prompt params, per response metrics, and text
lib/
  api.ts     # fetch helpers with base URL negotiation and error helpers
  types.ts   # Experiment, ParameterSet, and DTO typings shared in the UI
```

## Key architectural decisions
- **Server-side range expansion** keeps the client light and ensures clamping/validation happens once before fan-out.
- **File-based persistence** in `experiments.json` favors portability and easy seeding; a database can wait until we truly feel concurrency.
- **React Query-first data fetching** centralizes mutations, retries, and cache invalidation so UI components stay presentational and easy to reason about.
- **Deterministic heuristics** in `MetricsService` avoid second-pass LLM calls, keeping cost predictable and making exports reproducible.
- **API/Client contract via DTOs**: shared typings reduce drift between Nest controllers and the Next.js client during iteration, and future we is grateful for the shared truth.
