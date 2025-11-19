# Deployment, Time Estimates & Assumptions

## Hosting choices
- **Web app**: Deploy `apps/web` to Vercel or Netlify using `pnpm --filter web build`. Both platforms natively support the Next.js App Router, incremental static regeneration, and environment variables such as `NEXT_PUBLIC_API_URL`.
- **API service**: Deploy `apps/api` to Render, Railway, or Fly.io using the Node 18 image. Set `PORT` (default 3010) and `WEB_APP_URL` for CORS. Because persistence is file-based, mount a writable volume so `data/experiments.json` survives restarts.
- **Workspace scripts**: `pnpm dev` runs both apps locally; in CI, `pnpm --filter api test` and `pnpm --filter web lint` keep quality gates reproducible. Turborepo caching (configured in `turbo.json`) speeds up incremental deploys.

### Environment configuration
| Variable | Consumer | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Web | Absolute URL to the deployed API (e.g., `https://api.genai-labs.example.com`). |
| `WEB_APP_URL` | API | Origin allowed by CORS so the browser can call the Nest endpoints. |
| `PORT` | API | Overrides the default 3010 port; most platforms inject this automatically. |
| `NODE_ENV` | Both | Standard runtime toggle for dev/prod configuration. |

## Time estimates recap
The CSV at the repository root (`time_estimates.csv`) captures both planned and actual hours. Summary below mirrors that file for quick reference.

| Task | Estimated (h) | Actual (h) | Notes |
| --- | --- | --- | --- |
| Planning & architecture | 1.0 | 1.2 | Roadmap design plus CSV prep, included spec review and IA sketches. |
| Backend experiment API | 3.0 | 2.3 | Nest module, storage wiring, heuristics implementation. |
| Frontend visual lab | 2.5 | 2.1 | Layout, typography, dashboards. |
| Experiment workflow | 3.5 | 2.4 | Parameter controls, TanStack Query wiring, export interactions. |
| Persistence & export | 1.5 | 1.0 | File repository and client-side download utilities. |
| Docs & polish | 2.0 | 0.8 | README work plus accessibility passes. |
| Architecture docs | 1.0 | 0.9 | Dedicated architecture/UI/metrics/deployment write-ups. |

**Total:** estimated 14.5 hours vs. 12.7 actual.

## Assumptions
1. **LLM provider**: The mock `LlmService` is sufficient for experimentation; no external API keys are required for demo mode. Swapping in OpenAI or Anthropic later should happen behind the same service interface.
2. **Data privacy**: Experiments only live in `experiments.json`. Users accept that clearing the file resets history and that no PII leaves the workspace.
3. **Traffic profile**: The current architecture targets small lab teams (single-digit concurrent users). File I/O and in-memory sorting suffice; migrating to a database (e.g., Postgres) becomes necessary only if concurrency or storage requirements grow.
4. **Browser support**: Modern evergreen browsers (Chromium, Firefox, Safari) are assumed. Legacy IE/EdgeHTML builds are not tested because the UI depends on CSS features such as logical properties and container-based spacing.
