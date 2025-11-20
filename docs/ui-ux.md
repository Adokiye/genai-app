# UI & UX Design Notes

## Visual language
- **Palette**: the console leans on a three-step indigo ramp (`#3C5CCC`, `#9AA8F8`, `#C8D2FF`) for emphasis plus neutral slate grays for body copy. The same hues appear in metric badges and bullet accents so the lab feels cohesive.
- **Typography**: Satoshi-inspired sans typography (declared in `app/layout.tsx`) keeps dense experiment data legible. Headers use tighter leading and uppercase tracking to mimic lab instruments, while body text stays at 16–18px for readability.
- **Surfaces**: cards combine white backgrounds, 24–32px radii, and long-shadow gradients (`shadow-[0_30px_80px_-60px_rgba(60,92,204,0.8)]`) to separate interactive panels without overwhelming the page.

## Layout rationale
1. **Mission hero** (left column) frames the lab goals and heuristics so new visitors understand the workflow before touching controls.
2. **Experiment design form** (right column) groups related fields—prompt, temperature range, top_p range, response density, and token budget—into stacked cards with inline helper text. A single CTA keeps focus on running the sweep.
3. **Summary and comparison rail** directly below the fold visualizes averages (coverage, richness) and the best scoring combo, encouraging rapid iteration.
4. **Response grid** shows cards sorted by score. Each card repeats the metric badges and includes a quick analysis sentence for scanning.
5. **History sidebar** (desktop breakpoint) lists previous experiments with delete/export controls, mirroring the data model.

## Interaction design
- **React Query status messaging**: `status` text beneath the form provides immediate feedback (“Generating parameter sweep…” or errors) without modals.
- **Exports**: JSON export buttons live both in the SiteHeader (global history) and on each experiment summary (per-run download) so power users can grab artifacts regardless of scroll position.
- **Selection model**: clicking an experiment in the history rail updates `selectedId`, rerendering the summary and response grid. No additional routing keeps the experience fast.
- **Responsive behavior**: grids collapse to single columns below 1024px, while typography and spacing scale down via Tailwind utility classes baked into each component.

## User journey
1. Land on the mission hero, skim the heuristics, and trust the deterministic setup.
2. Paste or adjust the default prompt, tweak temperature and top_p ranges via min/max/step controls, and choose how many variants per combo to compare.
3. Submit the form; watch status text confirm generation and scroll to the comparison rail once the mutation resolves.
4. Inspect the best combo summary, skim average coverage/richness stats, and open the detailed response cards to read specific completions.
5. Export the winning experiment or the full history, optionally delete noisy runs, and repeat with a refined prompt.
