'use client';

import { ResponseVariant } from '@/lib/types';

export function ResponseCard({
  response,
  isActive,
}: {
  response: ResponseVariant;
  isActive?: boolean;
}) {
  const { parameters, metrics } = response;
  return (
    <article
      className={`rounded-3xl border transition-all duration-300 p-6 flex flex-col gap-4 theme-border ${
        isActive
          ? 'border-[#3C5CCC] bg-[var(--brand-soft)] shadow-lg shadow-[#3C5CCC]/20'
          : 'theme-surface card-hover'
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-muted">Temperature · Top_p</p>
          <p className="text-lg font-semibold text-primary-color">
            {parameters.temperature.toFixed(2)} / {parameters.topP.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">Overall quality</p>
          <p className="text-2xl font-semibold text-primary-color">
            {(metrics.overall * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <p className="text-sm text-secondary leading-6 whitespace-pre-line">
        {response.text}
      </p>
      <div className="grid grid-cols-2 gap-3 text-xs text-secondary">
        <Metric label="Length" value={metrics.lengthEfficiency} />
        <Metric label="Coverage" value={metrics.coverage} />
        <Metric label="Richness" value={metrics.richness} />
        <Metric label="Structure" value={metrics.structure} />
        <Metric label="Clarity" value={metrics.clarity} />
        <Metric
          label="Read time"
          value={`${metrics.readingTimeSeconds}s`}
          isRaw
        />
      </div>
      <p className="text-sm font-medium text-primary-color rounded-2xl px-4 py-3 border theme-border theme-surface">
        {response.analysis}
      </p>
    </article>
  );
}

function Metric({
  label,
  value,
  isRaw,
}: {
  label: string;
  value: number | string;
  isRaw?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl px-3 py-2 border theme-border theme-surface">
      <span className="font-medium text-muted">{label}</span>
      <span className="font-semibold text-primary-color">
        {typeof value === 'number' && !isRaw
          ? `${Math.round(value * 100)}%`
          : value}
      </span>
    </div>
  );
}
