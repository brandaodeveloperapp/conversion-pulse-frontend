'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { setLocale } from '@/lib/i18n/set-locale';
import type { AppLocale } from '@/i18n/locales';

const OPTIONS: { locale: AppLocale; messageKey: 'pt' | 'en' }[] = [
  { locale: 'pt-BR', messageKey: 'pt' },
  { locale: 'en', messageKey: 'en' },
];

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const change = (next: AppLocale) => {
    if (next === locale) return;
    startTransition(() => {
      void setLocale(next);
    });
  };

  return (
    <div
      role="group"
      aria-label={t('label')}
      data-pending={pending ? '' : undefined}
      className="flex items-center gap-1 rounded-md border border-border-subtle p-0.5 text-xs data-pending:opacity-60"
    >
      {OPTIONS.map(({ locale: optionLocale, messageKey }, i) => (
        <button
          key={optionLocale}
          type="button"
          aria-pressed={locale === optionLocale}
          aria-label={t(messageKey)}
          disabled={pending}
          onClick={() => change(optionLocale)}
          className={
            (locale === optionLocale
              ? 'bg-primary text-on-primary '
              : 'text-text-secondary hover:bg-surface-raised ') +
            (i > 0 ? 'ml-0.5 ' : '') +
            'flex-1 rounded px-2 py-1 font-medium transition-colors disabled:cursor-not-allowed'
          }
        >
          {t(messageKey)}
        </button>
      ))}
    </div>
  );
}
