import { NumericRange } from '../types';

export type CreateExperimentDto = {
  prompt: string;
  temperatureRange: NumericRange;
  topPRange: NumericRange;
  variantsPerCombo: number;
  maxTokens: number;
};

export const normalizeRange = (range: NumericRange): NumericRange => {
  const min = Number(range.min ?? 0);
  const max = Number(range.max ?? min);
  const step = Number(range.step ?? 0.1);

  if (Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(step)) {
    throw new Error('Invalid range values');
  }

  if (step <= 0) {
    throw new Error('Step must be greater than 0');
  }

  if (max < min) {
    throw new Error('Max must be greater than min');
  }

  return { min, max, step };
};

export const expandRange = (range: NumericRange): number[] => {
  const values: number[] = [];
  const limit = range.max + range.step / 2;
  for (let current = range.min; current <= limit; current += range.step) {
    values.push(Number(current.toFixed(2)));
  }
  return values;
};
