'use client';

import clsx from 'clsx';

export function MetricBadge({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number | string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl px-4 py-2 border flex flex-col min-w-[120px]',
        emphasis
          ? 'border-[#3C5CCC] bg-[#EFF2FF]'
          : 'border-slate-200 bg-white',
      )}
    >
      <span className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <span className="text-2xl font-semibold text-slate-900">
        {typeof value === 'number' ? `${Math.round(value * 100)}%` : value}
      </span>
    </div>
  );
}
