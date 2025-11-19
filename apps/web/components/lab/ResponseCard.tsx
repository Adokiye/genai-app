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
      className={`rounded-3xl border transition-all duration-300 ${
        isActive
          ? 'border-[#3C5CCC] bg-[#EFF2FF]/60 shadow-lg shadow-[#3C5CCC]/20'
          : 'border-slate-200 bg-white'
      } p-6 flex flex-col gap-4`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-slate-500">Temperature · Top_p</p>
          <p className="text-lg font-semibold text-slate-900">
            {parameters.temperature.toFixed(2)} / {parameters.topP.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Overall quality</p>
          <p className="text-2xl font-semibold text-slate-900">
            {(metrics.overall * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-6 whitespace-pre-line">
        {response.text}
      </p>
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
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
      <p className="text-sm font-medium text-slate-700 bg-white/70 rounded-2xl px-4 py-3 border border-slate-100">
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
    <div className="flex items-center justify-between bg-white/70 rounded-2xl px-3 py-2 border border-slate-100">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">
        {typeof value === 'number' && !isRaw
          ? `${Math.round(value * 100)}%`
          : value}
      </span>
    </div>
  );
}
