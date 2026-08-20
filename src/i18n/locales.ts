export const LOCALES = ['pt-BR', 'en'] as const;

export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'pt-BR';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

const MESSAGE_FILES: Record<AppLocale, string> = {
  'pt-BR': 'pt',
  en: 'en',
};

export function messageFileFor(locale: AppLocale): string {
  return MESSAGE_FILES[locale];
}
