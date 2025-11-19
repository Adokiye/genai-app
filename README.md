# GenAI.Labs — LLM Experiment Console

A polished full-stack lab for exploring how temperature and top_p choices change LLM completions. The workspace generates multiple responses for a prompt, scores them with handcrafted heuristics (length efficiency, coverage, richness, structure, clarity), stores the experiment history, and supports JSON exports for audits.

> **Deliverables checklist**
> - ✅ Full-stack app (Next.js 16 + NestJS) with state management via TanStack Query
> - ✅ Custom scoring metrics implemented on the API without extra LLM calls
> - ✅ Persistent experiment log (file-based repository) with export buttons
> - ✅ Polished Satoshi-themed UI with brand colors, responsive layout, and comparison dashboards
> - ⏱️ Time tracking lives in [`time_estimates.csv`](./time_estimates.csv)

## Live demo & video
- **Live URL:** _Provide deployment link here (e.g., Vercel + Render pair)_
- **Demo video (5–10 min):** _Add Loom/YouTube link once recorded_

## Architecture
```
Next.js (app router, SSR) ──> TanStack Query hooks ──> NestJS API ──> Mock LLM generator + metric engine
                                                └──> Local JSON persistence (apps/api/data/experiments.json)
```
- **Frontend (apps/web)**
  - Next.js 16 App Router with SSR-ready pages and client components for interactive sections
  - TanStack Query for fetching/invalidating experiments
  - Design system built around Satoshi font, #3C5CCC accents, and responsive cards
  - Export helpers write JSON blobs directly from the browser
- **Backend (apps/api)**
  - NestJS v9 service with `/experiments` CRUD endpoints plus `/health`
  - Deterministic mock LLM generator that varies tone based on parameters
  - Metrics service computes heuristics (see below) in a single pass
  - File-based repository keeps a rolling history at `apps/api/data/experiments.json`

## Quality metrics
| Metric | Description |
| --- | --- |
| **Length efficiency** | Measures how close the response is to an adaptive target length derived from prompt size (capped) |
| **Coverage** | Keyword overlap between prompt tokens (>4 letters) and the completion vocabulary |
| **Richness** | Type/token ratio (unique tokens ÷ total tokens) to penalize repetition |
| **Structure** | Rewards multi-paragraph/bullet organization using newline heuristics |
| **Clarity** | Uses sentence-length variance to penalize hard-to-read rambles |
| **Overall** | Weighted blend: 25% length, 25% coverage, 20% richness, 15% structure, 15% clarity |

The API returns per-response metrics plus natural-language analysis. The UI highlights best performers and comparison boards for each temperature/top_p combination.

## Running locally
```bash
# install workspace deps
pnpm install

# start the NestJS API (defaults to http://localhost:3010)
pnpm --filter api start:dev

# in another terminal start the Next.js client (http://localhost:3000)
pnpm --filter web dev
```
Set `NEXT_PUBLIC_API_URL=http://localhost:3010` when running the web client if you change ports. The API honors `PORT` and `WEB_APP_URL` (CORS) environment variables.

## API quick reference
| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Health payload |
| `GET` | `/experiments` | Returns experiment history (newest first) |
| `GET` | `/experiments/:id` | Fetch a single experiment |
| `POST` | `/experiments` | Body matches `CreateExperimentPayload` (prompt, temp range, top_p range, variants, maxTokens) |
| `DELETE` | `/experiments/:id` | Removes an experiment from the log |

## Persistence & exports
- Experiments persist to `apps/api/data/experiments.json`. Commit the file if you want seeded demos.
- The client exposes two export buttons:
  - **Export run:** downloads the currently selected experiment (JSON)
  - **Export all:** downloads the full history for reporting

## UI/UX guidelines implemented
- Satoshi font stack loaded via CDN with CSS fallbacks
- White background and layered cards using the #3C5CCC palette and lighter tints (#EFF2FF, #C8D2FF)
- Header/footer use the provided GenAI Labs logos and stay consistent across breakpoints
- Hover/focus states on interactive history items for accessibility

## Future enhancements
- Swap the mock generator with a live OpenAI/Anthropic integration once API keys are available
- Persist experiments to a database (Supabase, Postgres) for multi-user collaboration
- Add CSV exports and chart overlays for metric trends
- Ship hosted deployment + narrated demo video

## Deployment notes
- Suggested stack: deploy API on Render/Fly (Node 18), serve web via Vercel. Configure `NEXT_PUBLIC_API_URL` to the public API URL.
- Remember to keep `apps/api/data/experiments.json` writable or back it with cloud storage when deploying.
