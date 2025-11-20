# Architecture & Data Flow

## System overview
GenAI Labs is a pnpm workspace that hosts two runtimes:
- **apps/web** — a Next.js App Router client that renders the lab UI, orchestrates experiments with TanStack Query, and exports JSON packets directly from the browser.
- **apps/api** — a NestJS service that brokers OpenAI Chat Completions requests, evaluates the outputs with deterministic heuristics, and persists the entire experiment log in `apps/api/data/experiments.json` for versioned audits.

A single `.env` (or deployment secret store) wires the two via `NEXT_PUBLIC_API_URL` on the client and `WEB_APP_URL` on the API for CORS. Both share the workspace TypeScript config and scripts defined at the repository root.

## Request lifecycle
1. The user submits an experiment design from `apps/web/app/page.tsx`, which serializes the prompt, temperature/top_p ranges, variants per combo, and max tokens.
2. `lib/api.ts` posts the payload to `POST /experiments` exposed by the Nest controller.
3. `ExperimentsService` iterates over every parameter combination, asks `LlmService` to call OpenAI for text, feeds each response into `MetricsService`, and attaches a human readable analysis string.
4. The repository writes the new experiment to the JSON data store (newest first) and returns the fully sorted result set.
5. React Query invalidates `['experiments']`, refreshing the timeline so the UI can highlight the top scoring response and show aggregate insights per parameter combo.

This flow keeps the client stateless: every render derives its data from the API and the persisted history, so refreshing the browser never loses experiments.

## REST API surface
| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | GET | Returns service metadata and the status message from `AppService`.
| `/experiments` | GET | Lists experiments ordered from newest to oldest so the UI can build the history rail.
| `/experiments/:id` | GET | Fetches a single experiment (used for deep links and QA tooling).
| `/experiments` | POST | Generates a full parameter sweep, scores variants, persists the run, and returns the complete object.
| `/experiments/:id` | DELETE | Removes an experiment so users can curate the lab log without manually editing JSON files.

## Component structure (apps/web)
```
app/
  layout.tsx      # typography, metadata, providers (QueryClient, font CSS)
  page.tsx        # entire experiment workflow (form, summaries, response grid)
  providers.tsx   # isolates all React providers to keep layout clean
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
- **Native OpenAI integration**: the API manages authentication, retries, and parameter translation for OpenAI so the UI only has to send prompts once.
- **File-based persistence**: storing `experiments.json` alongside the codebase keeps deployments simple (no database provisioning) and allows seed data via git.
- **Range expansion on the server**: the API normalizes ranges before iterating them, which means the client can stay lightweight and trust the backend for validation and clamping.
- **React Query everywhere**: caching and mutation utilities centralize network logic, simplify optimistic updates, and allow easy invalidation when experiments change.
