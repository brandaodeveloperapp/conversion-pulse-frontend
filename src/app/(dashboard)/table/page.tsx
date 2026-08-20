import { Suspense } from 'react';
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
  return (
    <>
      <PageHeader
        title="Tabela"
        subtitle="Todos os pontos do recorte. Volume ao lado da taxa — a taxa sozinha engana no wpp."
      />
      <Suspense key={JSON.stringify(filters)} fallback={<LoadingPanel />}>
        <Content filters={filters} />
      </Suspense>
    </>
  );
}

async function Content({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  let data;
  try {
    data = await fetchTimeseries(filters);
  } catch (error) {
    return <ErrorPanel status={error instanceof ApiError ? error.status : 0} />;
  }
  if (data.series.length === 0) {
    return <EmptyPanel message="Nenhum ponto no recorte selecionado." />;
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-text-muted">{data.series.length} pontos</p>
      <SeriesTable series={data.series} />
    </div>
  );
}
