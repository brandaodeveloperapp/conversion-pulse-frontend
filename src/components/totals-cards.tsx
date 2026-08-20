import type { TimeseriesMeta, TimeseriesTotals } from '@/lib/api/types';
import { asInt, asPercent } from '@/lib/format';

interface Props {
  totals: TimeseriesTotals;
  meta: TimeseriesMeta;
}

export function TotalsCards({ totals, meta }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card label="Envios" value={asInt(totals.sent)} />
      <Card label="Conversões" value={asInt(totals.converted)} />
      <Card label="Taxa de conversão" value={asPercent(totals.conversionRate)} accent />
      <Card
        label="Consulta"
        value={`${meta.queryMs} ms`}
        hint={meta.cached ? 'cache' : meta.source}
      />
    </div>
  );
}

function Card({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={
          accent
            ? 'mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400'
            : 'mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100'
        }
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
