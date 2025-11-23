# UI & UX Design Notes

## Visual language
- **Palette**: an indigo ramp (`#3C5CCC`, `#9AA8F8`, `#C8D2FF`) keeps highlights friendly, with slate neutrals for copy so eyes can rest. Error states lean coral (`#FF7A76`) to gently say “hey, fix this” without panic.
- **Typography**: a Satoshi-inspired sans declared in `app/layout.tsx`. Headlines use tighter leading and uppercase tracking for a lab feel; body text sits at 16–18px so the experience never feels squinty.
- **Surfaces**: white cards with 24–32px radii and long-shadow gradients (`shadow-[0_30px_80px_-60px_rgba(60,92,204,0.8)]`) separate interactive panels while keeping the page calm and airy.

## Layout rationale
1. **Mission hero** (left column) frames goals and heuristics so first-time visitors understand the workflow before touching controls.
2. **Experiment form** (right column) groups prompt, temperature range, top_p range, variant count, and token budget into stacked cards with helper copy. A single CTA keeps the focus on running the sweep.
3. **Summary rail** below the fold visualizes averages (coverage, richness) and highlights the best scoring combo to encourage quick iteration.
4. **Response grid** shows cards sorted by score with metric badges, parameter chips, and a short analysis sentence for scanning.
5. **History sidebar** (desktop) lists previous experiments with delete/export controls, mirroring the persisted data model and reminding folks that nothing disappears on refresh.

## Interaction design
- **Status feedback**: React Query status text beneath the form confirms mutations and errors without modals.
- **Exports**: JSON exports live in both `SiteHeader` (global history) and per-experiment summaries so power users can grab artifacts anywhere on the page.
- **Selection model**: clicking a history item updates `selectedId`, rerendering the summary and response grid without extra routing.
- **Responsive behavior**: grids collapse to single columns below 1024px; spacing scales down via Tailwind utilities already embedded in each component.
- **Accessibility**: focus rings stay obvious on all CTA buttons; color choices meet 4.5:1 contrast on text and 3:1 on UI chrome so no one has to squint or guess.

## User journey (humanized)
1. Land on the mission hero, skim heuristics, and trust the deterministic setup.
2. Paste or tweak the prompt, adjust temperature/top_p ranges with min/max/step controls, and choose how many variants per combo feel manageable.
3. Submit the form; watch the status line confirm generation and follow the page down to the comparison rail when the mutation resolves.
4. Skim the best combo summary, scan average coverage/richness stats, and dip into response cards to read the tone or structure.
5. Export the winning experiment or full history, optionally prune noisy runs, and loop with a refined prompt informed by what felt right. The goal is to let someone feel accompanied, not lectured, through the experiment loop.
