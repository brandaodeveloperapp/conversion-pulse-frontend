'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NAV_ITEMS } from '@/lib/nav-items';

const ICONS: Record<string, React.ReactNode> = {
  '/overview': (
    <path d="M3 12h4l2 6 4-14 2 8h4" />
  ),
  '/channels': (
    <>
      <rect x="3" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="7" width="4" height="13" rx="1" />
      <rect x="17" y="3" width="4" height="17" rx="1" />
    </>
  ),
  '/table': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 4v16" />
    </>
  ),
  '/compare': (
    <>
      <rect x="3" y="4" width="7" height="16" rx="1.5" />
      <rect x="14" y="4" width="7" height="16" rx="1.5" />
    </>
  ),
  '/about': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
};

export function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();

  return (
    <nav aria-label={t('ariaLabel')} className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={query ? `${item.href}?${query}` : item.href}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={
              active
                ? 'group relative flex items-center gap-3 rounded-md bg-primary-subtle px-3 py-2 text-sm font-medium text-text-primary'
                : 'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary'
            }
          >
            {active ? (
              <span
                aria-hidden
                className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary"
              />
            ) : null}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}
            >
              {ICONS[item.href]}
            </svg>
            <span className="flex flex-col">
              <span>{t(`items.${item.key}.label`)}</span>
              <span className="text-[0.68rem] text-text-muted">
                {t(`items.${item.key}.hint`)}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
