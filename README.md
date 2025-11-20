# GenAI Labs Experiment Console

## A welcoming overview
GenAI Labs is a playground for people who love to see how prompt tweaking actually shapes language model behavior. The project bundles a Next.js interface and a NestJS application into one pnpm workspace so that writers, researchers, and engineers can share a single experiment log, compare generated drafts, and export JSON archives for later study. Everything is tuned toward clarity: the UI highlights the best responses, the metrics explain why a variant wins, and the API keeps a persistent record so you can trace exactly which OpenAI parameters produced each output.

## How everything works together
The interface uses the Next.js App Router along with TanStack Query so that fetching, caching, and optimistic updates happen automatically. Every experiment request calls into the NestJS service, which relays the prompt to OpenAI's Chat Completions API (defaulting to `gpt-4o-mini`) using the requested temperature and top_p grid. When an API key is absent the service automatically swaps in a deterministic mock responder so offline demos remain possible. As soon as the API scores the completions, it writes the record to a JSON file, which means your entire lab notebook lives in version control and can be exported in one click from the browser.

## Running the lab locally
1. Install workspace dependencies with `pnpm install` at the repository root.
2. Create an `.env` file for the API that defines `OPENAI_API_KEY=<your key>` (and optionally `OPENAI_MODEL=gpt-4o-mini`).
3. Launch the NestJS API with `pnpm --filter api start:dev`. It listens on port 3010 unless you override `PORT`.
4. In another terminal start the Next.js client with `pnpm --filter web dev`. Point `NEXT_PUBLIC_API_URL` to the API origin if you customize ports. The API also observes `WEB_APP_URL` for CORS.

## LLM scoring heuristics
The API evaluates each completion with five heuristics: length efficiency (response length vs an adaptive target), coverage (prompt keyword overlap), richness (type token ratio), structure (multiline organization), and clarity (sentence length variance). A weighted blend (twenty five percent length, twenty five percent coverage, twenty percent richness, fifteen percent structure, fifteen percent clarity) becomes the overall score that the UI highlights.

### Extended documentation
Need the deeper story behind the architecture, design system, or deployment approach? The `/docs` folder contains living references:
- [`docs/architecture.md`](docs/architecture.md) — workspace overview, request lifecycle, and component inventory.
- [`docs/ui-ux.md`](docs/ui-ux.md) — palette choices, layout rationale, and the intended user journey.
- [`docs/quality-metrics.md`](docs/quality-metrics.md) — formulas, examples, and limitations behind each heuristic.
- [`docs/deployment.md`](docs/deployment.md) — hosting strategy, environment variables, time estimates, and explicit assumptions.

## API endpoints you can rely on
1. GET /health: confirms the service is responsive and notes version information from `AppService`.
2. GET /experiments: returns the persisted experiment list ordered from newest to oldest.
3. GET /experiments/:id: fetches a single experiment with metadata, responses, and per response metrics.
4. POST /experiments: accepts the `CreateExperimentDto` payload with prompt text, temperature range, top_p range, number of variants, and max token budget, then generates and scores completions.
5. DELETE /experiments/:id: removes an experiment from storage so the UI history can stay curated.

## Living tour of the repository
### README.md
This document narrates the entire project so future collaborators immediately understand the goals, architecture, and workflows.

### apps
Top level folder that holds both runtime applications. Dive into `apps/web` for the Next.js client and `apps/api` for the NestJS service. They share dependencies managed by pnpm workspaces.

### node_modules (root)
Automatically generated dependencies for workspace level tooling. It keeps linting, formatting, and pnpm scripts consistent across the entire project.

### package.json
Defines workspace scripts like `pnpm dev` targets, declares shared dependencies, and establishes TypeScript settings inherited by child packages.

### pnpm-workspace.yaml
Describes the monorepo structure so pnpm can install dependencies once and link packages from `apps/api` and `apps/web` without duplication.

### time_estimates.csv
Personal log of effort spent on major milestones. It pairs timestamps with task descriptions so project planning stays transparent.

### turbo.json
Configuration for Turborepo powered caching. It knows how to rebuild or skip tasks for the API and web packages based on dependency graphs.

## Deep look at apps/web
### apps/web/README.md
Introduces the web package specific workflows and notes any UI only tasks. It complements the main README with design reminders.

### apps/web/app
Hosts the Next.js App Router entry points.
#### apps/web/app/layout.tsx
Defines the root layout with the Satoshi inspired typography, metadata, and provider wrappers. It renders shared header and footer components.
#### apps/web/app/page.tsx
Renders the primary experiment console view. It fetches experiment history through TanStack Query hooks and orchestrates the lab components.
#### apps/web/app/providers.tsx
Centralizes React providers, such as QueryClientProvider, ensuring hooks work in every client component without repetitive boilerplate.
#### apps/web/app/globals.css
Global styles for typography, background, grid system, and responsive behavior. It encodes the GenAI Labs palette and focus states.
#### apps/web/app/favicon.ico
The site icon packaged for browsers and device shortcuts.

### apps/web/components
Reusable React pieces split into thematic folders.
#### apps/web/components/layout/SiteHeader.tsx
Navigation bar with brand logo, experiment export buttons, and responsive adjustments for mobile readers.
#### apps/web/components/layout/SiteFooter.tsx
Footer copy with attribution, documentation links, and contact cues so visitors know how to continue exploring the project.
#### apps/web/components/lab/ResponseCard.tsx
Card that visualizes a single completion, highlighting prompt settings, metrics, and the actual text with syntax aware typography.
#### apps/web/components/lab/MetricBadge.tsx
Compact badge showing one metric label, score, and tooltip level description so users understand the evaluation at a glance.

### apps/web/lib
Utility helpers for the client.
#### apps/web/lib/api.ts
Wraps fetch calls with TanStack Query friendly functions, handles base URL logic, and centralizes error formatting.
#### apps/web/lib/types.ts
TypeScript definitions for experiments, responses, and metric payloads shared across components.

### apps/web/public
Static assets served directly by Next.js.
#### apps/web/public/logo-text.svg
Vector version of the GenAI Labs logotype for the header.
#### apps/web/public/logo-brain.svg
Iconic brain mark used beside the logotype to reinforce the experimentation theme.
#### apps/web/public/file.svg
Illustration used near export actions to signal downloadable artifacts.
#### apps/web/public/globe.svg
Graphic reserved for future internationalization callouts.
#### apps/web/public/window.svg
Decorative asset for hero cards showcasing the app chrome.
#### apps/web/public/next.svg and apps/web/public/vercel.svg
Logos for framework attribution inside the footer.

### apps/web/postcss.config.mjs
Configures PostCSS plugins (for example nesting) so the CSS pipeline can stay modern without ejecting from Next.js defaults.

### apps/web/tsconfig.json
Extends the root TypeScript config with path aliases specific to the web app, ensuring editor tooling can resolve components and libs.

### apps/web/next.config.ts
Next.js configuration file that toggles experimental flags, image domains, and environment specific tweaks for the web runtime.

### apps/web/eslint.config.mjs
Lints the React codebase with opinionated rules that align with the GenAI Labs style guide. It keeps components accessible and typed.

### apps/web/package.json
Declares React, Next.js, TanStack Query, and UI specific dependencies plus scripts such as `pnpm dev`, `pnpm build`, and `pnpm lint` scoped to the web app.

### apps/web/node_modules
Locally installed dependencies for the web package. pnpm links only what this app needs so deployments stay slim.

## Deep look at apps/api
### apps/api/README.md
Focuses on backend setup instructions, NestJS conventions, and any API only scripts.

### apps/api/data/experiments.json
The persistent experiment log. Each POST request appends structured history containing prompt inputs, completions, and scores. The file can be committed for sample data or cleared for a fresh run.

### apps/api/nest-cli.json
Configuration for the Nest CLI, dictating default collection paths and compiler behavior.

### apps/api/package.json and package-lock.json
List backend dependencies such as Nest core packages, class-validator, and ts-node. Scripts like `start:dev`, `start:prod`, and `test` live here.

### apps/api/tsconfig.json and tsconfig.build.json
TypeScript compiler settings for development and production builds. They ensure decorators, emit helpers, and path aliases match Nest expectations.

### apps/api/node_modules
Dependency tree for the server. Installed separately so that deploying the API does not include web only packages.

### apps/api/src/main.ts
Entry point that bootstraps the Nest application, enables CORS using `WEB_APP_URL`, sets up global validation pipes, and listens on the configured port.

### apps/api/src/app.module.ts
Root module wiring together controllers and providers, including the experiments module.

### apps/api/src/app.controller.ts and app.service.ts
`AppController` exposes the `/health` endpoint while `AppService` formats the response message and version metadata.

### apps/api/src/app.controller.spec.ts
Unit test confirming that the `/health` endpoint behaves as expected and that dependency injection is wired correctly.

### apps/api/src/experiments/experiments.module.ts
Nest module dedicated to experiment handling. It registers the controller, service, repository, metrics service, and the OpenAI-backed LLM service.

### apps/api/src/experiments/experiments.controller.ts
Defines the REST endpoints for listing, fetching, creating, and deleting experiments. It delegates business logic to the service layer.

### apps/api/src/experiments/experiments.service.ts
Orchestrates experiment creation. It loops over every parameter combination, asks the OpenAI LLM service for completions, feeds them into the metrics service, and persists the scored results.

### apps/api/src/experiments/experiment.repository.ts
Simple file based persistence utility. It reads and writes `experiments.json`, handles ID generation, and guarantees newest first ordering.

### apps/api/src/experiments/llm.service.ts
Thin wrapper around OpenAI's Chat Completions API. It injects the user prompt plus additional guidance, forwards the requested temperature/top_p/max token values, and returns the streamed markdown text for scoring. If `OPENAI_API_KEY` is not configured it falls back to a structured mock responder so the workflow keeps functioning.

### apps/api/src/experiments/metrics.service.ts
Evaluates completions with the heuristics outlined earlier. It returns both numeric scores and plain language explanations so the UI can surface insights.

### apps/api/src/experiments/dto/create-experiment.dto.ts
Validation schema describing the experiment creation payload. Class validator decorators enforce prompt presence, numeric ranges, and variant limits.

### apps/api/src/experiments/types.ts
Shared interfaces for experiments, responses, and scoring results. They keep the service, repository, and controller perfectly aligned.

### apps/api/src/experiments/dto (directory)
Container for DTO files. Currently it holds the create DTO but it can grow with update or filter DTOs as the API expands.

### apps/api/test/app.e2e-spec.ts
End to end test that spins up the Nest app in memory, hits the REST endpoints, and asserts on HTTP status codes plus payload structure.

### apps/api/test/jest-e2e.json
Jest configuration for the e2e suite, pointing to ts-jest presets and ensuring the correct setup files load before the tests run.

## Exporting and persistence from the UI
The web client exposes two buttons within the header: one downloads the currently selected experiment while the other downloads the entire history. Because the API stores everything in `apps/api/data/experiments.json`, exporting never requires extra computation or third party services.

## Deployment guidance
Deploy the API to a Node friendly host such as Render or Fly, making sure the data directory stays writable or is redirected to managed storage. Ship the web app to Vercel or any Next.js ready platform, set `NEXT_PUBLIC_API_URL` to the deployed API endpoint, and confirm `WEB_APP_URL` matches the public web origin so that CORS remains open only to your domain.
