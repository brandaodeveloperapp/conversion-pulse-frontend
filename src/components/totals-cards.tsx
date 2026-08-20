import type { TimeseriesMeta, TimeseriesTotals } from '@/lib/api/types';
import { asInt, asPercent } from '@/lib/format';

interface Props {
  totals: TimeseriesTotals;
  meta: TimeseriesMeta;
}

export function TotalsCards({ totals, meta }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card label="Envios" value={asInt(totals.sent)} />
      <Card label="Conversões" value={asInt(totals.converted)} />
      <Card label="Taxa de conversão" value={asPercent(totals.conversionRate)} accent />
      <Card
        label="Consulta"
        value={`${meta.queryMs} ms`}
        hint={meta.cached ? 'via cache' : meta.source}
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
    <div className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm">
      <p
        className="font-display text-[0.62rem] font-semibold uppercase text-text-muted"
        style={{ letterSpacing: 'var(--tracking-nav)' }}
      >
        {label}
      </p>
      <p
        className={
          (accent ? 'text-primary ' : 'text-text-primary ') +
          'mt-1.5 font-mono text-2xl font-semibold tabular-nums'
        }
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[0.7rem] text-text-muted">{hint}</p> : null}
    </div>
  );
}
