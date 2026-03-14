import { localeToBCP47, type Locale } from './types';

export interface FormatDateOptions {
  locale: Locale;
  includeTime?: boolean;
  shortMonth?: boolean;
  nullText?: string;
}

export function formatDate(
  dateString: string | null | undefined,
  options: FormatDateOptions,
): string {
  if (!dateString) return options.nullText ?? '';

  const bcp47 = localeToBCP47[options.locale];

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: options.shortMonth ? 'short' : 'long',
    day: 'numeric',
  };

  if (options.includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
  }

  return new Date(dateString).toLocaleDateString(bcp47, dateOptions);
}
