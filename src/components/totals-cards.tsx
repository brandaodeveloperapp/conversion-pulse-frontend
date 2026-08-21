import { getLocale, getTranslations } from 'next-intl/server';
import type { TimeseriesMeta, TimeseriesTotals } from '@/lib/api/types';
import { asInt, asPercent, asPointsDelta, asSignedInt } from '@/lib/format';

export interface TotalsDelta {
  /** Absolute change (current − previous) for sent and converted. */
  sent: number;
  converted: number;
  /** rateA = current period rate, rateB = previous period rate. The pp delta is
   *  asPointsDelta(rateA, rateB) = current − previous; null when either is null. */
  rateA: number | null;
  rateB: number | null;
}

interface Props {
  totals: TimeseriesTotals;
  meta: TimeseriesMeta;
  /** Period-over-period change vs the equally-sized window before this one. */
  delta?: TotalsDelta;
}

export async function TotalsCards({ totals, meta, delta }: Props) {
  const t = await getTranslations('totalsCards');
  const locale = await getLocale();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card
        label={t('sent')}
        value={asInt(totals.sent, locale)}
        delta={delta ? { text: asSignedInt(delta.sent, locale), n: delta.sent } : undefined}
      />
      <Card
        label={t('converted')}
        value={asInt(totals.converted, locale)}
        delta={
          delta ? { text: asSignedInt(delta.converted, locale), n: delta.converted } : undefined
        }
      />
      <Card
        label={t('rate')}
        value={asPercent(totals.conversionRate, locale)}
        accent
        delta={
          delta
            ? {
                text: asPointsDelta(delta.rateA, delta.rateB, locale),
                n:
                  delta.rateA !== null && delta.rateB !== null
                    ? delta.rateA - delta.rateB
                    : 0,
              }
            : undefined
        }
      />
      <Card
        label={t('query')}
        value={`${meta.queryMs} ms`}
        hint={meta.cached ? t('viaCache') : meta.source}
      />
    </div>
  );
}

function Card({
  label,
  value,
  hint,
  accent,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  delta?: { text: string; n: number };
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
      {delta ? (
        <p
          className={
            'mt-0.5 inline-flex items-center gap-1 font-mono text-[0.7rem] tabular-nums ' +
            (delta.n > 0
              ? 'text-success'
              : delta.n < 0
                ? 'text-danger'
                : 'text-text-muted')
          }
        >
          <span aria-hidden>{delta.n > 0 ? '▲' : delta.n < 0 ? '▼' : '='}</span>
          {delta.text}
        </p>
      ) : hint ? (
        <p className="mt-0.5 text-[0.7rem] text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
