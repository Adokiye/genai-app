# GenAI Labs API

NestJS service that powers the LLM Lab experience. It accepts experiment payloads, fans out
parameter combinations to OpenAI, scores each completion with deterministic heuristics, and
persists the results to `data/experiments.json` for auditing and export.

## Environment variables
| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port to bind the HTTP server (defaults to `3010`). |
| `WEB_APP_URL` | No | Origin allowed by CORS so the Next.js client can call the API. |
| `OPENAI_API_KEY` | No | Secret used by `LlmService` to call OpenAI's Chat Completions endpoint. When omitted, a deterministic mock responder is used. |
| `OPENAI_MODEL` | No | Override the model (defaults to `gpt-4o-mini`). |

Add `OPENAI_API_KEY=<your key>` to unlock real completions; otherwise the API falls back to the built-in mock generator so demos can run without credentials.

## Scripts
```bash
pnpm --filter api start:dev   # watch mode with live reload
pnpm --filter api start       # production build (use NODE_ENV=production)
pnpm --filter api lint        # lint the TypeScript sources
```

## Key modules
- `experiments.controller.ts` — exposes `GET/POST/DELETE /experiments` endpoints.
- `experiments.service.ts` — expands parameter grids, orchestrates OpenAI calls, and stores scored responses.
- `llm.service.ts` — wraps the OpenAI Chat Completions API and injects consistent instructions.
- `metrics.service.ts` — computes coverage, richness, length efficiency, structure, clarity, and reading time.
- `experiment.repository.ts` — file-based persistence for the experiment history.

## Data persistence
The repository writes every experiment to `data/experiments.json`. Mount a persistent volume
(or commit seed data) if you want history to survive deployments.

## Error handling
The API surfaces descriptive 4xx/5xx messages when:
- The prompt or numeric ranges are invalid (`400`).
- OpenAI rejects a request (`500`).
- A caller requests an experiment ID that does not exist (`404`).

Pair this service with the Next.js frontend by setting `NEXT_PUBLIC_API_URL` to the deployed API URL.
