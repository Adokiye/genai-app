# Deployment, Time Estimates & Assumptions

## Hosting choices
- **Web app**: Deploy `apps/web` to Vercel or Netlify using `pnpm --filter web build`. Both support the Next.js App Router, ISR, and env vars such as `NEXT_PUBLIC_API_URL`. I like Vercel for the smoother preview flow.
- **API service**: Deploy `apps/api` to Render, Railway, Fly.io, or similar Node 18 hosts. Set `PORT` (default 3010) and `WEB_APP_URL` for CORS. Mount a writable volume so `data/experiments.json` survives restarts—nothing is sadder than losing history after a reboot.
- **Workspace scripts**: `pnpm dev` runs both apps locally; CI can rely on `pnpm --filter api test` and `pnpm --filter web lint`. Turborepo caching (`turbo.json`) keeps incremental deploys fast and predictable.

### Environment configuration
| Variable | Consumer | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Web | Absolute URL to the deployed API (e.g., `https://api.genai-labs.example.com`). |
| `WEB_APP_URL` | API | Origin allowed by CORS so the browser can call Nest endpoints. |
| `PORT` | API | Overrides the default 3010 port; most platforms inject this automatically. |
| `OPENAI_API_KEY` | API | Secret used by `LlmService` to authenticate with OpenAI. Required for real runs. |
| `OPENAI_MODEL` | API | Optional override (defaults to `gpt-4o-mini`) to target a different OpenAI model. |
| `NODE_ENV` | Both | Standard dev/prod toggle. |
| `MOCK_LLM` | API | Optional flag to return canned completions during demos when an API key is unavailable. |

## Time estimates recap
The CSV at the repository root (`time_estimates.csv`) captures both planned and actual hours. Summary below mirrors that file for quick reference and stays honest about the timeline (started on Wednesday, wrapped core work by Friday, and polished docs today).

| Task | Estimated (h) | Actual (h) | Notes |
| --- | --- | --- | --- |
| Estimates tracking | 0.5 | 0.3 | Prep CSV updates and cadence. |
| Architecture & decisions | 1.0 | 0.6 | Data flow, endpoints, component map. |
| UI/UX rationale | 1.0 | 0.5 | Palette, layout, journey notes. |
| Quality metrics | 1.0 | 0.5 | Formulas plus worked example. |
| Deployment & assumptions | 0.5 | 0.4 | Hosting options and env guidance. |
| Docs review & polish | 0.5 | 0.3 | Consistency, tone, and proofing. |

**Total:** estimated 4.5 hours vs. 2.6 actual so far.

## Assumptions
1. **LLM provider**: OpenAI powers experiments by default. Supply `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) or enable `MOCK_LLM` during offline demos.
2. **Data privacy**: Experiments live only in `experiments.json`. Clearing the file resets history; no PII leaves the workspace unless users export it.
3. **Traffic profile**: Designed for small lab teams (single-digit concurrent users). File I/O and in-memory sorting suffice; migrate to Postgres/S3 when concurrency grows.
4. **Browser support**: Modern evergreen browsers (Chromium, Firefox, Safari) are assumed. Legacy Edge/IE are not tested because the UI relies on modern CSS utilities.
