import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Pagination as PaginationMeta } from '@/lib/api/types';

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  pagination: PaginationMeta;
  basePath: string;
  searchParams: SearchParams;
}

/**
 * Server-rendered pager. Each page is a plain link that carries the current
 * filters in the URL, so navigation stays server-side — no client fetch, no
 * loss of the shared-link property. Renders nothing when there is a single page.
 */
export async function Pagination({ pagination, basePath, searchParams }: Props) {
  const { page, totalPages, totalItems, pageSize } = pagination;
  if (totalPages <= 1) return null;

  const t = await getTranslations('pagination');
  const shownFrom = (page - 1) * pageSize + 1;
  const shownTo = Math.min(page * pageSize, totalItems);

  const hrefFor = (target: number): string => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) continue;
      params.set(key, Array.isArray(value) ? value[0] : value);
    }
    params.set('page', String(target));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav
      aria-label={t('pageOf', { page, totalPages })}
      className="flex items-center justify-between gap-4 text-sm"
    >
      <p className="text-xs text-text-muted">
        {t('showing', { count: `${shownFrom}–${shownTo}`, total: totalItems })}
      </p>
      <div className="flex items-center gap-2">
        <PagerLink
          href={hrefFor(page - 1)}
          disabled={page <= 1}
          label={t('prev')}
        />
        <span className="font-mono text-xs tabular-nums text-text-secondary">
          {t('pageOf', { page, totalPages })}
        </span>
        <PagerLink
          href={hrefFor(page + 1)}
          disabled={page >= totalPages}
          label={t('next')}
        />
      </div>
    </nav>
  );
}

function PagerLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  const base =
    'rounded-md border px-3 py-1.5 font-display text-xs transition-colors';
  if (disabled) {
    return (
      <span
        aria-disabled
        className={`${base} cursor-not-allowed border-border-subtle text-text-muted opacity-40`}
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      scroll={false}
      className={`${base} border-border-subtle text-text-secondary hover:border-primary hover:text-primary`}
    >
      {label}
    </Link>
  );
}
