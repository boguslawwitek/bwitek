import { describe, it, expect } from 'vitest';
import { mapIconProvider, localeToBCP47 } from '../types';

describe('mapIconProvider', () => {
  it('maps lucide to lu', () => {
    expect(mapIconProvider('lucide')).toBe('lu');
  });

  it('maps simple-icons to si', () => {
    expect(mapIconProvider('simple-icons')).toBe('si');
  });

  it('returns null for unknown providers', () => {
    expect(mapIconProvider('font-awesome')).toBeNull();
  });

  it('returns null for null', () => {
    expect(mapIconProvider(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(mapIconProvider(undefined)).toBeNull();
  });
});

describe('localeToBCP47', () => {
  it('maps pl to pl-PL', () => {
    expect(localeToBCP47.pl).toBe('pl-PL');
  });

  it('maps en to en-US', () => {
    expect(localeToBCP47.en).toBe('en-US');
  });
});
