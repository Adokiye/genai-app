import { Injectable } from '@nestjs/common';
import { QualityMetrics } from './types';

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

@Injectable()
export class MetricsService {
  evaluate(prompt: string, response: string): QualityMetrics {
    const promptTokens = tokenize(prompt).filter((token) => token.length > 4);
    const responseTokens = tokenize(response);
    const uniqueResponseTokens = new Set(responseTokens);

    const words = responseTokens.length || 1;
    const charCount = response.length;
    const targetLength = Math.max(prompt.length * 1.1, 350);
    const ratio = Math.min(charCount, targetLength) / targetLength;
    const lengthEfficiency = Number(ratio.toFixed(3));

    const richness = Number((uniqueResponseTokens.size / words).toFixed(3));

    const overlapHits = promptTokens.filter((token) =>
      uniqueResponseTokens.has(token),
    ).length;
    const coverage = Number(
      (overlapHits / Math.max(promptTokens.length, 1)).toFixed(3),
    );

    const structure = Number(
      Math.min(
        1,
        (response.split('\n-').length - 1 + response.split('\n\n').length) / 6,
      ).toFixed(3),
    );

    const clarity = Number(
      (1 - Math.min(1, this.calculateSentenceVariance(response))).toFixed(3),
    );

    const overall = Number(
      (
        lengthEfficiency * 0.25 +
        richness * 0.2 +
        coverage * 0.25 +
        structure * 0.15 +
        clarity * 0.15
      ).toFixed(3),
    );

    const readingTimeSeconds = Number(((words / 180) * 60).toFixed(1));

    return {
      lengthEfficiency,
      richness,
      coverage,
      structure,
      clarity,
      overall,
      readingTimeSeconds,
    };
  }

  private calculateSentenceVariance(text: string) {
    const sentences = text
      .split(/(?<=[.!?])/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    if (sentences.length <= 1) {
      return 0.2;
    }

    const lengths = sentences.map((sentence) => sentence.split(' ').length);
    const avg = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) /
      lengths.length;

    return Math.min(1, variance / 50);
  }
}
