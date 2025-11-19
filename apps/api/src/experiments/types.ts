export type NumericRange = {
  min: number;
  max: number;
  step: number;
};

export type ParameterSet = {
  temperature: number;
  topP: number;
  maxTokens: number;
};

export type QualityMetrics = {
  lengthEfficiency: number;
  richness: number;
  coverage: number;
  structure: number;
  clarity: number;
  overall: number;
  readingTimeSeconds: number;
};

export type ResponseVariant = {
  id: string;
  parameters: ParameterSet;
  text: string;
  metrics: QualityMetrics;
  analysis: string;
};

export type Experiment = {
  id: string;
  prompt: string;
  createdAt: string;
  temperatures: number[];
  topPs: number[];
  variantsPerCombo: number;
  maxTokens: number;
  summary: string;
  responses: ResponseVariant[];
};
