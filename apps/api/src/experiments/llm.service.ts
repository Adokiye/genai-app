import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ParameterSet } from './types';

@Injectable()
export class LlmService {
  private readonly client?: OpenAI;
  private readonly model: string;
  private readonly mode: 'openai' | 'mock';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
      this.mode = 'openai';
      this.model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    } else {
      this.mode = 'mock';
      this.model = 'mock-lab-strategist';
    }
  }

  async generate(prompt: string, params: ParameterSet): Promise<string> {
    if (this.mode === 'mock') {
      return this.generateMockResponse(prompt, params);
    }

    if (!this.client) {
      throw new InternalServerErrorException('OpenAI client unavailable.');
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: params.temperature,
        top_p: params.topP,
        max_tokens: params.maxTokens,
        messages: [
          {
            role: 'system',
            content:
              'You are an operations-focused AI strategist. Produce structured, defensible guidance that highlights launch narratives, high-risk areas, and 30-day actions. Use markdown headings and concise bullets.',
          },
          {
            role: 'user',
            content: `Prompt:\n${prompt}\n\nContext:\n- Respond in the mindset of an experimentation lab toggling temperature ${params.temperature.toFixed(
              2,
            )} and top_p ${params.topP.toFixed(
              2,
            )}.\n- Explain how the configuration influences creativity vs. determinism while delivering actionable insights.`,
          },
        ],
      });

      const text = completion.choices[0]?.message?.content?.trim();

      if (!text) {
        throw new InternalServerErrorException(
          'OpenAI returned an empty completion.',
        );
      }

      return text;
    } catch (error) {
      console.error('OpenAI completion failed', error);
      throw new InternalServerErrorException(
        'Unable to generate a completion from OpenAI. Try again with a lower range or verify your API quota.',
      );
    }
  }

  private generateMockResponse(prompt: string, params: ParameterSet) {
    const keywords = Array.from(
      new Set(
        (prompt.toLowerCase().match(/\b[a-z]{5,}\b/g) ?? []).filter(
          (word) => !['launch', 'prompt', 'context'].includes(word),
        ),
      ),
    ).slice(0, 4);

    const narrativeTone =
      params.temperature >= 0.7
        ? 'imaginative growth-first story'
        : params.temperature >= 0.4
        ? 'balanced playbook'
        : 'precision-first brief';
    const determinism =
      params.topP >= 0.9
        ? 'broad exploration of adjacent possibilities'
        : params.topP >= 0.75
        ? 'measured experimentation'
        : 'tight guardrails and predictable outputs';

    const keywordBullets = keywords.map(
      (word) =>
        `- Tie recommendations back to **${word}** level KPIs and adoption gates.`,
    );

    const structure = [
      `### Configuration snapshot`,
      `- Temperature: ${params.temperature.toFixed(
        2,
      )} / Top_p: ${params.topP.toFixed(2)}`,
      `- Response mode: ${narrativeTone} with ${determinism}.`,
      `- Max tokens budget: ${params.maxTokens}`,
      '',
      `### Launch narrative`,
      `- Frame the copilot as a ${narrativeTone} that still respects ops guardrails.`,
      `- Narrate how toggling temperature + top_p in this band influences stakeholder confidence.`,
      `- Emphasize pilot milestones and data they unlock for scale.`,
      '',
      `### High-risk areas`,
      `- Watch for hallucinations around regulatory or safety claims; create red-team prompts.`,
      `- Instrument telemetry around any workflow touching ${
        keywords[0] ?? 'critical workflows'
      }.`,
      `- Require human approval paths for irreversible actions.`,
      '',
      `### 30-day actions`,
      `1. Stand up a living experiment log that captures every parameter sweep and outcome.`,
      `2. Align enablement, RevOps, and support leaders on what "success" looks like per scenario.`,
      `3. Publish an FAQ describing when to increase temperature vs. constrain top_p.`,
      '',
      `### Parameter commentary`,
      `- Higher temperature pushes ideation; compensate with stricter review templates.`,
      `- Lower top_p forces determinism; expect fewer novel phrasings but easier QA.`,
      ...keywordBullets,
      '',
      `*Generated via ${this.model} mock responder for offline demos.*`,
    ];

    return structure.join('\n');
  }
}
