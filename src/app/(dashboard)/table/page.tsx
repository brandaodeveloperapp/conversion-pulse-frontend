import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { SeriesTable } from '@/components/series-table';
import { Pagination } from '@/components/pagination';
import { EmptyPanel, ErrorPanel, LoadingPanel, PageHeader } from '@/components/panels';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters, type DashboardFilters } from '@/lib/api/filters';

export const dynamic = 'force-dynamic';

/** Rows per page on the full table. The chart routes stay unpaginated. */
const DEFAULT_PAGE_SIZE = 50;

type SearchParams = Record<string, string | string[] | undefined>;

export default async function TablePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const parsed = parseFilters(raw);
  // The table always paginates: default the page size when the URL omits it.
  const filters: DashboardFilters = {
    ...parsed,
    pageSize: parsed.pageSize ?? DEFAULT_PAGE_SIZE,
    page: parsed.page ?? 1,
  };
  const t = await getTranslations('table');
  const tPanels = await getTranslations('panels');

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      {/* No key: keep prior rows visible while the server re-fetches (no fallback flash). */}
      <Suspense fallback={<LoadingPanel label={tPanels('loading')} />}>
        <Content filters={filters} searchParams={raw} />
      </Suspense>
    </>
  );
}

async function Content({
  filters,
  searchParams,
}: {
  filters: DashboardFilters;
  searchParams: SearchParams;
}) {
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

  const total = data.meta.pagination?.totalItems ?? data.series.length;

  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || key === 'page' || key === 'pageSize') continue;
    exportParams.set(key, Array.isArray(value) ? value[0] : value);
  }
  const exportHref = `/table/export?${exportParams.toString()}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {t('pointsCount', { count: total })}
        </p>
        <a
          href={exportHref}
          download
          className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 font-display text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          <span aria-hidden className="font-mono">
            ↓
          </span>
          {t('exportCsv')}
        </a>
      </div>
      <SeriesTable
        series={data.series}
        sort={{
          field: filters.sort,
          dir: filters.dir,
          basePath: '/table',
          searchParams,
        }}
      />
      {data.meta.pagination ? (
        <Pagination
          pagination={data.meta.pagination}
          basePath="/table"
          searchParams={searchParams}
        />
      ) : null}
    </div>
  );
}
