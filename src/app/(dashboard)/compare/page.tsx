import { Suspense } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { ConversionChart } from '@/components/conversion-chart';
import { CompareStatus } from '@/components/compare-status';
import { ErrorPanel, LoadingPanel, PageHeader } from '@/components/panels';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters } from '@/lib/api/filters';
import { asPercent, pivotByPeriod } from '@/lib/format';
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
  const tPanels = await getTranslations('panels');

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title={t('panelA')} paramKey="statusesA" selected={a}>
          <Suspense
            key={`a-${JSON.stringify({ base, a })}`}
            fallback={<LoadingPanel label={tPanels('loading')} />}
          >
            <ChartFor filters={{ ...base, conversionStatuses: a }} />
          </Suspense>
        </Panel>
        <Panel title={t('panelB')} paramKey="statusesB" selected={b}>
          <Suspense
            key={`b-${JSON.stringify({ base, b })}`}
            fallback={<LoadingPanel label={tPanels('loading')} />}
          >
            <ChartFor filters={{ ...base, conversionStatuses: b }} />
          </Suspense>
        </Panel>
      </div>
    </>
  );
}

function Panel({
  title,
  paramKey,
  selected,
  children,
}: {
  title: string;
  paramKey: string;
  selected: number[];
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-sm font-semibold text-text-primary">{title}</h2>
        <CompareStatus paramKey={paramKey} selected={selected} />
      </div>
      {children}
    </section>
  );
}

async function ChartFor({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const tPanels = await getTranslations('panels');
  const locale = await getLocale();
  let data;
  try {
    data = await fetchTimeseries(filters);
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
  const active: Channel[] =
    filters.channels.length > 0 ? filters.channels : data.meta.channels;
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-2xl font-semibold tabular-nums text-primary">
        {asPercent(data.totals.conversionRate, locale)}
      </p>
      <ConversionChart data={pivotByPeriod(data.series)} channels={active} />
    </div>
  );
}
