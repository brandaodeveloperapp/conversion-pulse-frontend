import { Suspense } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { ConversionChart } from '@/components/conversion-chart';
import { CompareStatus } from '@/components/compare-status';
import { ErrorPanel, LoadingPanel, PageHeader } from '@/components/panels';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters, type DashboardFilters } from '@/lib/api/filters';
import { asPercent, asPointsDelta, maxPivotRate, pivotByPeriod } from '@/lib/format';
import type { Channel } from '@/lib/api/types';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function statuses(raw: string | string[] | undefined, fallback: number[]): number[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return fallback;
  const parsed = value
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isInteger(v) && v >= 1 && v <= 6);
  return parsed.length > 0 ? parsed : fallback;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const base = parseFilters(params);
  const a = statuses(params.statusesA, [1]);
  const b = statuses(params.statusesB, [1, 5]);
  const t = await getTranslations('compare');

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      {/* No key: keep the prior comparison visible while the server re-fetches. */}
      <Suspense fallback={<LoadingPanel label={t('loading')} />}>
        <Comparison base={base} a={a} b={b} />
      </Suspense>
    </>
  );
}

async function Comparison({
  base,
  a,
  b,
}: {
  base: DashboardFilters;
  a: number[];
  b: number[];
}) {
  const t = await getTranslations('compare');
  const tPanels = await getTranslations('panels');
  const locale = await getLocale();

  let dataA;
  let dataB;
  try {
    [dataA, dataB] = await Promise.all([
      fetchTimeseries({ ...base, conversionStatuses: a }),
      fetchTimeseries({ ...base, conversionStatuses: b }),
    ]);
  } catch (error) {
    return (
      <ErrorPanel
        status={error instanceof ApiError ? error.status : 0}
        title={tPanels('errorTitle')}
        badRequestMessage={tPanels('errorBadRequest')}
        genericMessage={tPanels('errorGeneric')}
      />
    );
  }

  const rateA = dataA.totals.conversionRate;
  const rateB = dataB.totals.conversionRate;
  const pivotA = pivotByPeriod(dataA.series);
  const pivotB = pivotByPeriod(dataB.series);

  // Lock both charts to one Y range so the eye compares heights honestly.
  const sharedMax = maxPivotRate([...pivotA, ...pivotB]);
  const yDomain: [number, number] | undefined =
    sharedMax && sharedMax > 0 ? [0, sharedMax] : undefined;

  const activeA: Channel[] = base.channels.length > 0 ? base.channels : dataA.meta.channels;
  const activeB: Channel[] = base.channels.length > 0 ? base.channels : dataB.meta.channels;

  return (
    <div className="flex flex-col gap-4">
      {/* Delta banner: A, the signed difference, B — the number the eye used to guess */}
      <section className="grid grid-cols-3 items-center gap-2 rounded-lg border border-border-subtle bg-surface p-4 text-center">
        <Metric label={t('panelA')} value={asPercent(rateA, locale)} badge="A" />
        <div className="flex flex-col gap-0.5">
          <span
            className="font-display text-[0.62rem] font-semibold uppercase text-text-muted"
            style={{ letterSpacing: 'var(--tracking-nav)' }}
          >
            {t('delta')}
          </span>
          <span className="font-mono text-xl font-semibold tabular-nums text-text-primary">
            {asPointsDelta(rateA, rateB, locale)}
          </span>
        </div>
        <Metric label={t('panelB')} value={asPercent(rateB, locale)} badge="B" />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel badge="A" title={t('panelA')} paramKey="statusesA" selected={a}>
          <ConversionChart data={pivotA} channels={activeA} yDomain={yDomain} />
        </Panel>
        <Panel badge="B" title={t('panelB')} paramKey="statusesB" selected={b}>
          <ConversionChart data={pivotB} channels={activeB} yDomain={yDomain} />
        </Panel>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="inline-flex items-center gap-1.5">
        <Badge>{badge}</Badge>
        <span
          className="font-display text-[0.62rem] font-semibold uppercase text-text-muted"
          style={{ letterSpacing: 'var(--tracking-nav)' }}
        >
          {label}
        </span>
      </span>
      <span className="font-mono text-xl font-semibold tabular-nums text-primary">
        {value}
      </span>
    </div>
  );
}

function Panel({
  title,
  badge,
  paramKey,
  selected,
  children,
}: {
  title: string;
  badge: string;
  paramKey: string;
  selected: number[];
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-text-primary">
          <Badge>{badge}</Badge>
          {title}
        </h2>
        <CompareStatus paramKey={paramKey} selected={selected} />
      </div>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-subtle font-display text-[0.65rem] font-bold text-primary">
      {children}
    </span>
  );
}
