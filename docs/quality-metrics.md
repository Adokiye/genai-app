# Quality Metrics Reference

The Nest `MetricsService` converts each completion into a consistent scorecard so the UI can highlight high quality responses without another LLM pass. Every metric is normalized between 0 and 1 and rounded to three decimals.

## Tokenization assumptions
- Text is lowercased and stripped of punctuation before splitting on whitespace.
- Prompt tokens shorter than five characters are ignored for coverage calculations to avoid overcounting filler words.
- Reading time assumes 180 words per minute and is reported in seconds for quick comparisons.

## Metric formulas
| Metric | Formula | Notes |
| --- | --- | --- |
| Length efficiency | `min(charCount, targetLength) / targetLength` where `targetLength = max(prompt.length * 1.1, 350)` | Rewards answers that approach an adaptive target but penalizes excessive length. |
| Richness | `uniqueResponseTokens / totalResponseTokens` | Approximates lexical diversity (type-token ratio). |
| Coverage | `promptKeywordHits / max(promptKeywordCount, 1)` | Measures how many prompt keywords (length > 4) appear in the response. |
| Structure | `min(1, (bulletCount + paragraphBreaks) / 6)` | Counts `\n-` bullets and double newlines to encourage organized writing. |
| Clarity | `1 - min(1, sentenceLengthVariance / 50)` | Lower variance indicates more consistent sentence pacing. |
| Overall | `0.25*length + 0.2*richness + 0.25*coverage + 0.15*structure + 0.15*clarity` | Weighted blend that aligns with the lab’s emphasis on coverage and length. |
| Reading time (seconds) | `(words / 180) * 60` | Derived value that helps calibrate editing expectations. |

## Example interpretation
- A response with perfect coverage and structure but short length might still rank second because the weighted blend gives 40% of its mass to length + coverage.
- Bullet-heavy answers plateau once six structure signals are detected, keeping verbose outlines from skewing the score.
- Clarity bottoms out at variance ≥ 50 (roughly equivalent to sentences swinging wildly between 4 and 40 words), preventing pathological values from dominating the overall score.

## Limitations & future work
- The heuristics do not account for factual accuracy or toxicity. Pairing the export with a separate moderation pipeline is recommended before production use.
- Because coverage ignores short tokens, prompts filled with acronyms or short identifiers may appear under-covered. Providing descriptive prompts mitigates this.
- Reading time is calibrated for English prose; multilingual completions may diverge from the assumed 180 WPM baseline.
