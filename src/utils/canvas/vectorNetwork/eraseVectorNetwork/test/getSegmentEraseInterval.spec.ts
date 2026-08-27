// types
import { TErasedSegmentGeometry } from '../types';

// utils
import { getSegmentEraseInterval } from '../getSegmentEraseInterval';

// a straight horizontal segment from (0,0) to (100,0)
const STRAIGHT: TErasedSegmentGeometry = { end: { x: 100, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null };

describe('getSegmentEraseInterval', () => {
  it('should report "none" when the brush never reaches the segment', () => {
    // result
    expect(getSegmentEraseInterval(STRAIGHT, { x: 50, y: 50 }, { x: 50, y: 60 }, 5)).toEqual({ kind: 'none' });
  });

  it('should report "whole" when the brush covers both endpoints', () => {
    // result
    expect(getSegmentEraseInterval(STRAIGHT, { x: 0, y: 0 }, { x: 100, y: 0 }, 10)).toEqual({ kind: 'whole' });
  });

  it('should report "start" with the exit parameter when the brush covers the segment start', () => {
    // action — a 25-radius dab on the (0,0) end
    const result = getSegmentEraseInterval(STRAIGHT, { x: 0, y: 0 }, { x: 0, y: 0 }, 25);

    // result
    expect(result.kind).toBe('start');
    expect(result).toMatchObject({ tOut: expect.any(Number) });
    expect((result as { tOut: number }).tOut).toBeCloseTo(0.25, 5);
  });

  it('should collapse a start graze that removes nothing to "none"', () => {
    // action — brush only just touches vertex 0, no interior coverage
    const result = getSegmentEraseInterval(STRAIGHT, { x: 0, y: 0.4 }, { x: 0, y: 0.4 }, 0.5);

    // result
    expect(result).toEqual({ kind: 'none' });
  });

  it('should report "end" with the entry parameter when the brush covers the segment end', () => {
    // action
    const result = getSegmentEraseInterval(STRAIGHT, { x: 100, y: 0 }, { x: 100, y: 0 }, 25);

    // result
    expect(result.kind).toBe('end');
    expect((result as { tIn: number }).tIn).toBeCloseTo(0.75, 5);
  });

  it('should collapse an end graze that removes nothing to "none"', () => {
    // action
    const result = getSegmentEraseInterval(STRAIGHT, { x: 100, y: 0.4 }, { x: 100, y: 0.4 }, 0.5);

    // result
    expect(result).toEqual({ kind: 'none' });
  });

  it('should report "middle" with entry and exit parameters when the brush cuts the interior', () => {
    // action
    const result = getSegmentEraseInterval(STRAIGHT, { x: 50, y: 0 }, { x: 50, y: 0 }, 15) as { kind: string; tIn: number; tOut: number };

    // result
    expect(result.kind).toBe('middle');
    expect(result.tIn).toBeGreaterThan(0.3);
    expect(result.tIn).toBeLessThan(0.5);
    expect(result.tOut).toBeGreaterThan(0.5);
    expect(result.tOut).toBeLessThan(0.7);
  });

  it('should collapse an interior graze that spans a single sample to "none"', () => {
    // action
    const result = getSegmentEraseInterval(STRAIGHT, { x: 50, y: 0.4 }, { x: 50, y: 0.4 }, 0.5);

    // result
    expect(result).toEqual({ kind: 'none' });
  });

  it('should follow a curved segment along its flattened polyline', () => {
    // mock — a segment bowing upward; a dab at its apex should bite the middle
    const curved: TErasedSegmentGeometry = {
      end: { x: 100, y: 0 },
      start: { x: 0, y: 0 },
      tangentEnd: { x: -20, y: -60 },
      tangentStart: { x: 20, y: -60 },
    };

    // action
    const result = getSegmentEraseInterval(curved, { x: 50, y: -45 }, { x: 50, y: -45 }, 12);

    // result
    expect(result.kind).toBe('middle');
  });
});
