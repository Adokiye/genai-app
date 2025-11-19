import { Injectable } from '@nestjs/common';
import { ParameterSet } from './types';

const moods = [
  'optimistic',
  'measured',
  'critical',
  'playful',
  'technical',
];

const structuralPatterns = [
  ['Key takeaways', 'Risks to watch', 'Next steps'],
  ['Overview', 'Signals', 'Opportunities'],
  ['Context', 'Analysis', 'Recommendations'],
  ['Situation', 'Complications', 'Resolutions'],
];

@Injectable()
export class LlmService {
  generate(prompt: string, params: ParameterSet): string {
    const randomness = params.temperature;
    const focus = params.topP;

    const selectedMood = moods[
      Math.min(moods.length - 1, Math.floor(randomness * moods.length))
    ];

    const pattern = structuralPatterns[
      Math.floor(Math.random() * structuralPatterns.length)
    ];

    const bulletCount = Math.max(3, Math.round(focus * 4));
    const variationSeed = Math.floor(randomness * 1000 + focus * 100);

    const intro = `Using a ${selectedMood} tone, here is how the model interprets the prompt "${prompt}".`;
    const bullets = Array.from({ length: bulletCount }).map((_, index) => {
      const heading = pattern[index % pattern.length];
      const detail = this.buildDetail(prompt, randomness, focus, index + variationSeed);
      return `- **${heading}:** ${detail}`;
    });

    const closing =
      randomness > 0.7
        ? 'Creative mode emphasizes speculative but vivid ideas to stretch the solution space.'
        : 'Grounded mode favors structured, concise reasoning for confident execution.';

    return [intro, '', ...bullets, '', closing].join('\n');
  }

  private buildDetail(
    prompt: string,
    temperature: number,
    topP: number,
    seed: number,
  ) {
    const baseFacts = [
      'references the underlying user intent directly',
      'identifies supporting signals and guardrails',
      'flags ambiguity so humans can intervene early',
      'connects tactical steps to measurable outcomes',
      'tracks how the conversation might shift over time',
    ];

    const descriptors = [
      'ultra-focused',
      'systems level',
      'data-backed',
      'story-driven',
      'risk-aware',
      'human-centered',
    ];

    const verbs = [
      'amplify',
      'stress test',
      'prototype',
      'monitor',
      'simplify',
      'sequence',
    ];

    const fact = baseFacts[seed % baseFacts.length];
    const descriptor = descriptors[Math.floor((temperature * seed) % descriptors.length)];
    const verb = verbs[Math.floor((topP * seed) % verbs.length)];

    const scope =
      temperature > 0.65
        ? 'broad future-looking narratives'
        : 'tightly scoped execution details';

    return `Embraces ${descriptor} thinking to ${verb} ${scope} while it ${fact}.`;
  }
}
