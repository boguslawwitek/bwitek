import { describe, it, expect } from 'vitest';
import { formatDate } from '../format';

describe('formatDate', () => {
  it('returns empty string for undefined input', () => {
    expect(formatDate(undefined, { locale: 'pl' })).toBe('');
  });

  it('returns empty string for null input', () => {
    expect(formatDate(null, { locale: 'en' })).toBe('');
  });

  it('returns nullText when provided and date is null', () => {
    expect(formatDate(null, { locale: 'pl', nullText: 'nigdy' })).toBe('nigdy');
  });

  it('formats date in Polish', () => {
    const result = formatDate('2025-06-15T12:00:00Z', { locale: 'pl' });
    expect(result).toContain('2025');
    expect(result).toContain('15');
  });

  it('formats date in English', () => {
    const result = formatDate('2025-06-15T12:00:00Z', { locale: 'en' });
    expect(result).toContain('2025');
    expect(result).toContain('June');
  });

  it('includes time when requested', () => {
    const result = formatDate('2025-06-15T14:30:00Z', { locale: 'pl', includeTime: true });
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('does not include time by default', () => {
    const result = formatDate('2025-06-15T14:30:00Z', { locale: 'pl' });
    expect(result).not.toMatch(/\d{2}:\d{2}/);
  });

  it('uses short month when requested', () => {
    const withShort = formatDate('2025-06-15T12:00:00Z', { locale: 'en', shortMonth: true });
    const withLong = formatDate('2025-06-15T12:00:00Z', { locale: 'en' });
    expect(withShort.length).toBeLessThan(withLong.length);
  });
});
