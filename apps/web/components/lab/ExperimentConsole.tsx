'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  CreateExperimentPayload,
  Experiment,
  NumericRangeInput,
  ResponseVariant,
} from '@/lib/types';
import { MetricBadge } from './MetricBadge';
import { ResponseCard } from './ResponseCard';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';

const defaultPrompt = `You are advising a startup that is launching a responsible AI copilot for operations teams. Outline the launch narrative, high risk areas, and specific next steps for the first 30 days.`;

const buildRangeValues = (range: NumericRangeInput) => {
  const values: number[] = [];
  for (
    let current = range.min;
    current <= range.max + range.step / 2;
    current += range.step
  ) {
    values.push(Number(current.toFixed(2)));
  }
  return values;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', { timeZone: 'UTC' });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

export function ExperimentConsole() {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [temperatureRange, setTemperatureRange] = useState<NumericRangeInput>({
    min: 0.2,
    max: 0.8,
    step: 0.3,
  });
  const [topPRange, setTopPRange] = useState<NumericRangeInput>({
    min: 0.7,
    max: 1,
    step: 0.15,
  });
  const [variantsPerCombo, setVariantsPerCombo] = useState(2);
  const [maxTokens, setMaxTokens] = useState(260);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmExperiment, setConfirmExperiment] = useState<Experiment | null>(null);

  const experimentsQuery = useQuery({
    queryKey: ['experiments'],
    queryFn: api.listExperiments,
  });

  const experiments = useMemo(
    () => experimentsQuery.data ?? [],
    [experimentsQuery.data],
  );

  const selectedExperiment: Experiment | undefined = useMemo(() => {
    if (!experiments.length) return undefined;
    return experiments.find((exp) => exp.id === selectedId) ?? experiments[0];
  }, [experiments, selectedId]);

  const createExperiment = useMutation({
    mutationFn: (payload: CreateExperimentPayload) => api.createExperiment(payload),
    onSuccess: (result) => {
      setStatus('Experiment ready — scroll down to compare responses.');
      setSelectedId(result.id);
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
    onError: (error: Error) => {
      setStatus(error.message || 'Unable to create experiment');
    },
  });

  const deleteExperiment = useMutation({
    mutationFn: (id: string) => api.deleteExperiment(id),
    onSuccess: (_, id) => {
      if (selectedId === id) {
        setSelectedId(null);
      }
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
    onSettled: () => setConfirmExperiment(null),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Generating parameter sweep...');
    const payload: CreateExperimentPayload = {
      prompt,
      temperatureRange,
      topPRange,
      variantsPerCombo,
      maxTokens,
    };
    createExperiment.mutate(payload);
  };

  const exportExperiment = (experiment?: Experiment) => {
    if (!experiment) return;
    const blob = new Blob([JSON.stringify(experiment, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `genai-lab-${experiment.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportHistory = () => {
    if (!experiments.length) return;
    const blob = new Blob([JSON.stringify(experiments, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'genai-lab-history.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const confirmDeletion = () => {
    if (!confirmExperiment) return;
    deleteExperiment.mutate(confirmExperiment.id);
  };

  const comparisonRows = useMemo(() => {
    if (!selectedExperiment) return [];
    const map = new Map<string, ResponseVariant[]>();
    selectedExperiment.responses.forEach((response) => {
      const key = `${response.parameters.temperature.toFixed(2)} / ${response.parameters.topP.toFixed(2)}`;
      const existing = map.get(key) ?? [];
      existing.push(response);
      map.set(key, existing);
    });

    return Array.from(map.entries())
      .map(([combo, list]) => {
        const best = list.reduce((prev, next) =>
          prev.metrics.overall > next.metrics.overall ? prev : next,
        );
        const avg =
          list.reduce((sum, item) => sum + item.metrics.overall, 0) / list.length;
        return { combo, best, avg, count: list.length };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [selectedExperiment]);

  const bestResponse = selectedExperiment?.responses?.[0];
  const avgCoverage = selectedExperiment
    ? selectedExperiment.responses.reduce((sum, item) => sum + item.metrics.coverage, 0) /
      selectedExperiment.responses.length
    : 0;
  const avgRichness = selectedExperiment
    ? selectedExperiment.responses.reduce((sum, item) => sum + item.metrics.richness, 0) /
      selectedExperiment.responses.length
    : 0;

  return (
    <div className="min-h-screen theme-page">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="rounded-3xl border theme-border theme-surface p-6 shadow-[0_30px_80px_-60px_rgba(60,92,204,0.8)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#3C5CCC]">
              LLM Lab Mission
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-snug text-primary-color">
              Dial in temperatures, compare responses, and export a defensible LLM lab report.
            </h1>
            <p className="mt-4 text-base text-secondary">
              Generate multiple completions from the same prompt across a temperature and top_p grid.
              We score each variant across five heuristics (length efficiency, coverage, richness,
              structure, and clarity) to surface the most reliable configuration.
            </p>
            <ul className="mt-4 grid gap-3 text-sm text-secondary sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#3C5CCC]"></span>
                Adjustable parameter ranges & response counts
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#9AA8F8]"></span>
                Transparent quality heuristics without extra LLM calls
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#C8D2FF]"></span>
                Persistent history stored on the API for audit trails
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#3C5CCC]"></span>
                One-click exports for JSON lab packets
              </li>
            </ul>
          </div>
          <form
            className="rounded-3xl border theme-border theme-surface-alt p-6 flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-color">Experiment design</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-muted">
                Step 01
              </span>
            </div>
            <label className="text-sm font-medium text-primary-color">Prompt</label>
            <textarea
              className="min-h-[140px] rounded-2xl border theme-border theme-surface p-4 text-sm text-primary-color outline-none focus:border-[#3C5CCC]"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <RangeControl
                title="Temperature"
                description="Explore creativity vs. determinism"
                value={temperatureRange}
                onChange={setTemperatureRange}
                minLimit={0}
                maxLimit={1}
                step={0.05}
              />
              <RangeControl
                title="Top_p"
                description="Constrain nucleus sampling"
                value={topPRange}
                onChange={setTopPRange}
                minLimit={0.1}
                maxLimit={1}
                step={0.05}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-primary-color">
                  Variants per combo ({variantsPerCombo})
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  value={variantsPerCombo}
                  onChange={(event) => setVariantsPerCombo(Number(event.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-primary-color">
                  Max tokens ({maxTokens})
                </label>
                <input
                  type="range"
                  min={160}
                  max={600}
                  step={20}
                  value={maxTokens}
                  onChange={(event) => setMaxTokens(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <ParameterChip label="Temps" values={buildRangeValues(temperatureRange)} />
              <ParameterChip label="Top_p" values={buildRangeValues(topPRange)} />
              <span className="rounded-full theme-surface px-3 py-1 font-semibold text-secondary">
                {variantsPerCombo} responses per combo
              </span>
            </div>
            <button
              type="submit"
              disabled={createExperiment.isPending}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[#3C5CCC] px-6 py-3 text-white font-semibold shadow-lg shadow-[#3C5CCC]/30 disabled:opacity-60 clickable hover:shadow-xl"
            >
              {createExperiment.isPending ? 'Generating...' : 'Run Lab Sweep'}
            </button>
            {status && <p className="text-sm text-secondary">{status}</p>}
          </form>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border theme-border theme-surface p-6">
              <div className="flex flex-wrap items-center gap-4">
                <MetricBadge
                  label="Top score"
                  value={bestResponse?.metrics.overall ?? 0}
                  emphasis
                />
                <MetricBadge label="Avg coverage" value={avgCoverage} />
                <MetricBadge label="Avg richness" value={avgRichness} />
                <div className="rounded-2xl border border-dashed border-[#C8D2FF] bg-[var(--brand-soft)] px-4 py-3 text-sm text-secondary">
                  <p className="font-semibold text-primary-color">{selectedExperiment?.summary ?? 'Run an experiment to view stats.'}</p>
                  <p>{selectedExperiment ? formatDateTime(selectedExperiment.createdAt) : ''}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {selectedExperiment ? (
                selectedExperiment.responses.map((response) => (
                  <ResponseCard
                    key={response.id}
                    response={response}
                    isActive={response.id === bestResponse?.id}
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-dashed theme-border theme-surface p-12 text-center text-muted">
                  Submit an experiment to see side-by-side completions.
                </div>
              )}
            </div>
          </div>
          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border theme-border theme-surface p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary-color">Experiment history</h3>
                <button
                  onClick={exportHistory}
                  className="text-xs font-semibold text-[#3C5CCC] clickable hover:underline"
                  disabled={!experiments.length}
                >
                  Export all
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {experiments.length ? (
                  experiments.map((experiment) => (
                    <div
                      key={experiment.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(experiment.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') setSelectedId(experiment.id);
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3C5CCC] clickable card-hover theme-border theme-surface ${
                        selectedExperiment?.id === experiment.id
                          ? 'border-[#3C5CCC] bg-[var(--brand-soft)] text-primary-color'
                          : 'hover:border-[#3C5CCC]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{formatTime(experiment.createdAt)}</span>
                        <span className="text-xs text-muted">
                          {experiment.responses.length} outputs
                        </span>
                      </div>
                      <p className="text-xs text-secondary">{experiment.summary}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted">
                        <span>T {experiment.temperatures.join(', ')}</span>
                        <span>top_p {experiment.topPs.join(', ')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmExperiment(experiment);
                        }}
                        className="mt-2 text-xs text-rose-500 clickable hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No experiments yet.</p>
                )}
              </div>
            </div>
            <div className="rounded-3xl border theme-border theme-surface p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary-color">
                  Parameter comparison
                </h3>
                <button
                  onClick={() => exportExperiment(selectedExperiment)}
                  className="text-xs font-semibold text-[#3C5CCC] clickable hover:underline"
                  disabled={!selectedExperiment}
                >
                  Export run
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {comparisonRows.length ? (
                  comparisonRows.map((row) => (
                    <div
                      key={row.combo}
                      className="rounded-2xl border theme-border theme-surface-alt px-4 py-3 text-sm text-secondary"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-primary-color">{row.combo}</p>
                        <p className="text-xs text-muted">{row.count} variants</p>
                      </div>
                      <p>Best: {(row.best.metrics.overall * 100).toFixed(1)}% · Avg {(row.avg * 100).toFixed(1)}%</p>
                      <p className="text-xs text-muted">{row.best.analysis}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">Run an experiment to populate this board.</p>
                )}
              </div>
            </div>
            <div className="rounded-3xl border theme-border theme-surface p-5">
              <h3 className="text-lg font-semibold text-primary-color">Metric heuristics</h3>
              <p className="mt-2 text-sm text-secondary">
                We score every completion without extra API calls:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-secondary">
                <li>
                  <strong>Length efficiency:</strong> closeness to an adaptive token target derived from prompt size.
                </li>
                <li>
                  <strong>Coverage:</strong> overlap between prompt keywords (&gt;4 letters) and response vocabulary.
                </li>
                <li>
                  <strong>Richness:</strong> ratio of unique tokens to total tokens to detect repetition.
                </li>
                <li>
                  <strong>Structure:</strong> reward for multi-paragraph or bullet organization.
                </li>
                <li>
                  <strong>Clarity:</strong> penalizes large sentence-length variance for easier scanning.
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
      {confirmExperiment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border theme-border theme-surface p-6 shadow-2xl">
            <h4 className="text-lg font-semibold text-primary-color">Remove experiment?</h4>
            <p className="mt-2 text-sm text-secondary">
              Are you sure you want to remove “{confirmExperiment.summary}”? This will delete the
              experiment and its history.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmExperiment(null)}
                className="rounded-full border theme-border px-4 py-2 text-sm font-semibold text-secondary clickable hover:bg-[var(--surface-alt)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletion}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg clickable hover:bg-rose-500 disabled:opacity-60"
                disabled={deleteExperiment.isPending}
              >
                {deleteExperiment.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RangeControl({
  title,
  description,
  value,
  onChange,
  minLimit,
  maxLimit,
  step,
}: {
  title: string;
  description: string;
  value: NumericRangeInput;
  onChange: (value: NumericRangeInput) => void;
  minLimit: number;
  maxLimit: number;
  step: number;
}) {
  return (
    <div className="rounded-2xl border theme-border theme-surface p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-color">{title}</p>
          <p className="text-xs text-muted">{description}</p>
        </div>
        <span className="text-xs font-semibold text-[#3C5CCC]">
          {value.min.toFixed(2)}–{value.max.toFixed(2)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        {(['min', 'max', 'step'] as const).map((key) => (
          <label key={key} className="flex flex-col gap-1 text-secondary">
            <span className="font-medium capitalize">{key}</span>
            <input
              type="number"
              step={step}
              min={minLimit}
              max={maxLimit}
              value={value[key]}
              onChange={(event) =>
                onChange({
                  ...value,
                  [key]: Number(event.target.value),
                })
              }
              className="rounded-xl border theme-border theme-surface px-3 py-2 text-sm text-primary-color"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function ParameterChip({ label, values }: { label: string; values: number[] }) {
  return (
    <span className="rounded-full border theme-border theme-surface px-4 py-1 text-xs font-semibold text-secondary">
      {label}: {values.join(', ')}
    </span>
  );
}
