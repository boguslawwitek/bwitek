import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';

export function useTypedLocale(): Locale {
  return useLocale() as Locale;
}
