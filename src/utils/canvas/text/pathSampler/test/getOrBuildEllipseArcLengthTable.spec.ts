// types
import { TEllipseArcLengthSample } from 'types/canvas';

// utils
import { getOrBuildEllipseArcLengthTable } from '../getOrBuildEllipseArcLengthTable';

describe('getOrBuildEllipseArcLengthTable', () => {
  it('should build and cache a table keyed by width:height', () => {
    // mock
    const cache = new Map<string, TEllipseArcLengthSample[]>();

    // before
    const first = getOrBuildEllipseArcLengthTable(cache, 200, 100);

    // result
    expect(cache.get('200:100')).toBe(first);
  });

  it('should reuse the cached table instead of rebuilding it for the same width/height', () => {
    // mock
    const cache = new Map<string, TEllipseArcLengthSample[]>();

    // before
    const first = getOrBuildEllipseArcLengthTable(cache, 200, 100);
    const second = getOrBuildEllipseArcLengthTable(cache, 200, 100);

    // result
    expect(second).toBe(first);
    expect(cache.size).toBe(1);
  });

  it('should build a separate table for a different width/height key', () => {
    // mock
    const cache = new Map<string, TEllipseArcLengthSample[]>();

    // before
    getOrBuildEllipseArcLengthTable(cache, 200, 100);
    getOrBuildEllipseArcLengthTable(cache, 100, 100);

    // result
    expect(cache.size).toBe(2);
  });
});
