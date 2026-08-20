import { getLocale, getTranslations } from 'next-intl/server';
import type { TimeseriesMeta, TimeseriesTotals } from '@/lib/api/types';
import { asInt, asPercent } from '@/lib/format';

interface Props {
  totals: TimeseriesTotals;
  meta: TimeseriesMeta;
}

export async function TotalsCards({ totals, meta }: Props) {
  const t = await getTranslations('totalsCards');
  const locale = await getLocale();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card label={t('sent')} value={asInt(totals.sent, locale)} />
      <Card label={t('converted')} value={asInt(totals.converted, locale)} />
      <Card
        label={t('rate')}
        value={asPercent(totals.conversionRate, locale)}
        accent
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
