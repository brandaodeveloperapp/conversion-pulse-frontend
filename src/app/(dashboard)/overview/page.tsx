import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ConversionChart } from '@/components/conversion-chart';
import { SeriesTable } from '@/components/series-table';
import { TotalsCards } from '@/components/totals-cards';
import { ErrorPanel, LoadingPanel, PageHeader } from '@/components/panels';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters } from '@/lib/api/filters';
import { type Channel } from '@/lib/api/types';
import { pivotByPeriod } from '@/lib/format';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseFilters(await searchParams);
  const t = await getTranslations('overview');
  const tPanels = await getTranslations('panels');

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Suspense
        key={JSON.stringify(filters)}
        fallback={<LoadingPanel label={tPanels('loading')} />}
      >
        <Content filters={filters} />
      </Suspense>
    </>
  );
}

async function Content({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  const t = await getTranslations('overview');
  const tPanels = await getTranslations('panels');
  const tChannels = await getTranslations('channels');
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
  const pivot = pivotByPeriod(data.series);

  return (
    <div className="flex flex-col gap-6">
      <TotalsCards totals={data.totals} meta={data.meta} />
      <section className="rounded-lg border border-border-subtle bg-surface p-5 shadow-sm">
        <h2 className="mb-4 font-display text-sm font-medium text-text-secondary">
          {t('chartTitle', { channels: active.map((c) => tChannels(c)).join(', ') })}
        </h2>
        <ConversionChart data={pivot} channels={active} />
        <p className="mt-3 text-xs text-text-muted">{t('chartCaption')}</p>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-medium text-text-secondary">
            {t('firstPoints')}
          </h2>
          <Link
            href="/table"
            className="text-xs text-primary hover:text-primary-hover"
          >
            {t('viewFullTable')}
          </Link>
        </div>
        <SeriesTable series={data.series} limit={12} />
      </section>
    </div>
  );
}
