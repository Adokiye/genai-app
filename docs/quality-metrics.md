# Quality Metrics Reference

The Nest `MetricsService` converts each completion into a normalized scorecard so the UI can highlight high-quality responses without a second LLM pass. Every metric is normalized between 0 and 1 and rounded to three decimals unless noted otherwise. Think of it as a friendly referee that scores consistently rather than a black-box judge.

## Tokenization assumptions
- Text is lowercased and stripped of punctuation before splitting on whitespace.
- Prompt tokens shorter than five characters are ignored for coverage to avoid overcounting filler words.
- Reading time assumes 180 words per minute and is reported in seconds for quick comparisons, because we all skim differently.

## Metric formulas
| Metric | Formula | Notes |
| --- | --- | --- |
| Length efficiency | `min(charCount, targetLength) / targetLength` where `targetLength = max(prompt.length * 1.1, 350)` | Rewards answers that approach an adaptive target but penalizes excessive length. |
| Richness | `uniqueResponseTokens / totalResponseTokens` | Approximates lexical diversity (type-token ratio). |
| Coverage | `promptKeywordHits / max(promptKeywordCount, 1)` | Measures how many prompt keywords (length > 4) appear in the response. |
| Structure | `min(1, (bulletCount + paragraphBreaks) / 6)` | Counts `\n-` bullets and double newlines to encourage organized writing. |
| Clarity | `1 - min(1, sentenceLengthVariance / 50)` | Lower variance indicates more consistent sentence pacing. |
| Overall | `0.25*length + 0.2*richness + 0.25*coverage + 0.15*structure + 0.15*clarity` | Weighted blend aligned with coverage + length priorities. |
| Reading time (seconds) | `(words / 180) * 60` | Derived value to calibrate editing expectations. |

## Worked example
- Prompt keywords (len > 4): `innovation`, `ethics`, `governance`, `impact` → 4 total.
- Response sample: 620 chars, 105 words, 78 unique tokens, 3 bullets, 2 paragraph breaks, sentence length variance 18.
- Metrics:
  - Length efficiency: targetLength = max( prompt 440 * 1.1, 350 ) = 484 → `min(620,484)/484 ≈ 0.999` (capped at 1.000).
  - Richness: `78 / 105 ≈ 0.743`.
  - Coverage: `4/4 = 1.000` because all keywords are present.
  - Structure: `(3 + 2)/6 ≈ 0.833`.
  - Clarity: `1 - min(1, 18/50) = 0.64`.
  - Overall: `0.25*1 + 0.2*0.743 + 0.25*1 + 0.15*0.833 + 0.15*0.64 ≈ 0.883`.
  - Reading time: `(105/180)*60 ≈ 35.0 seconds`.

## Limitations & future work
- Heuristics do not check factual accuracy or toxicity; pair exports with separate moderation before production use.
- Coverage ignores short tokens, so acronym-heavy prompts may appear under-covered; add explicit descriptors to improve signals.
- Reading time assumes English prose; multilingual completions may diverge from the 180 WPM baseline.
- Structure favors bullets/paragraphs but cannot detect semantic flow. A lightweight rubric model or discourse parser could refine this without a heavy LLM dependency—and would make future us smile.
