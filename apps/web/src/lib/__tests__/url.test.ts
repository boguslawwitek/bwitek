import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFullImageUrl } from '../url';

describe('getFullImageUrl', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://api.example.com');
  });

  it('returns empty string for empty input', () => {
    expect(getFullImageUrl('')).toBe('');
  });

  it('returns absolute URLs unchanged', () => {
    expect(getFullImageUrl('https://cdn.example.com/img.png')).toBe('https://cdn.example.com/img.png');
  });

  it('returns http URLs unchanged', () => {
    expect(getFullImageUrl('http://cdn.example.com/img.png')).toBe('http://cdn.example.com/img.png');
  });

  it('prepends server URL for /api/uploads/ paths', () => {
    expect(getFullImageUrl('/api/uploads/img.png')).toBe('https://api.example.com/api/uploads/img.png');
  });

  it('prepends server URL + /api for /uploads/ paths', () => {
    expect(getFullImageUrl('/uploads/img.png')).toBe('https://api.example.com/api/uploads/img.png');
  });

  it('returns other paths unchanged', () => {
    expect(getFullImageUrl('/some/other/path.png')).toBe('/some/other/path.png');
  });
});
