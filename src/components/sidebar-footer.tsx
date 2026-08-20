'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';

export function SidebarFooter() {
  const t = useTranslations('sidebarFooter');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const hasFilters = params.toString().length > 0;

  const reset = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border-t border-border-subtle pt-4">
      <button
        type="button"
        onClick={reset}
        disabled={!hasFilters}
        className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        {t('clearFilters')}
      </button>
      <button
        type="button"
        onClick={copy}
        className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
        {copied ? t('linkCopied') : t('copyLink')}
      </button>
      <LanguageSwitcher />
    </div>
  );
}
