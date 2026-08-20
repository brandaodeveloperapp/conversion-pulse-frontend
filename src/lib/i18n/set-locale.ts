'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { LOCALE_COOKIE, isAppLocale, type AppLocale } from '@/i18n/locales';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Sets the NEXT_LOCALE cookie read by `i18n/request.ts` and revalidates the
 * whole route tree so every Server Component re-renders with the new
 * language on the same navigation — no URL segment involved.
 */
export async function setLocale(locale: AppLocale): Promise<void> {
  if (!isAppLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}
