import type messages from '../../messages/pt.json';
import type { AppLocale } from './locales';

declare module 'use-intl' {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
