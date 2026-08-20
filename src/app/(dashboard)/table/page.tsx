import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { SeriesTable } from '@/components/series-table';
import { EmptyPanel, ErrorPanel, LoadingPanel, PageHeader } from '@/components/panels';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters } from '@/lib/api/filters';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function TablePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseFilters(await searchParams);
  const t = await getTranslations('table');
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
  const t = await getTranslations('table');
  const tPanels = await getTranslations('panels');
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
  if (data.series.length === 0) {
    return <EmptyPanel message={t('empty')} />;
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-text-muted">
        {t('pointsCount', { count: data.series.length })}
      </p>
      <SeriesTable series={data.series} />
    </div>
  );
}
