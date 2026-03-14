import { describe, it, expect } from 'vitest';
import { stripHtml, truncateText } from '../text';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtml('no tags here')).toBe('no tags here');
  });

  it('handles nested tags', () => {
    expect(stripHtml('<div><p>nested <em>content</em></p></div>')).toBe('nested content');
  });

  it('handles self-closing tags', () => {
    expect(stripHtml('before<br/>after')).toBe('beforeafter');
  });
});

describe('truncateText', () => {
  it('does not truncate short text', () => {
    expect(truncateText('short')).toBe('short');
  });

  it('does not truncate text at exact limit', () => {
    const exactly150 = 'a'.repeat(150);
    expect(truncateText(exactly150)).toBe(exactly150);
  });

  it('truncates and adds ellipsis for long text', () => {
    const long = 'a'.repeat(200);
    const result = truncateText(long);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(153);
  });

  it('respects custom maxLength', () => {
    const text = 'a'.repeat(50);
    const result = truncateText(text, 20);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(23);
  });

  it('handles empty string', () => {
    expect(truncateText('')).toBe('');
  });
});
