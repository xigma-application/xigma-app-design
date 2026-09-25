// types
import { TStrokeRing } from '../types';

// utils
import { sampleStrokeRing } from '../sampleStrokeRing';

const ring: TStrokeRing = {
  cumulative: [0, 10, 10, 20],
  inner: [],
  lengths: [10, 0, 10, 10],
  mids: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
  outer: [
    { x: 0, y: -1 },
    { x: 10, y: -1 },
    { x: 11, y: 0 },
    { x: 11, y: 10 },
  ],
  perimeter: 30,
};

describe('sampleStrokeRing', () => {
  it('should interpolate the center, tangent and outward vector along a segment', () => {
    // result
    expect(sampleStrokeRing(ring, 5)).toEqual({ mid: { x: 5, y: 0 }, tangent: { x: 1, y: 0 }, vec: { x: 0, y: -1 } });
  });

  it('should skip zero-length segments and wrap distances around the ring', () => {
    // before
    const sample = sampleStrokeRing(ring, 15);
    const wrapped = sampleStrokeRing(ring, -15);

    // result
    expect(sample.mid).toEqual({ x: 10, y: 5 });
    expect(wrapped).toEqual(sample);
  });

  it('should stay on the last segment when every remaining segment is empty', () => {
    // mock
    const flat: TStrokeRing = {
      ...ring,
      cumulative: [0, 0],
      lengths: [0, 0],
      mids: [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ],
      outer: [
        { x: 1, y: 0 },
        { x: 1, y: 0 },
      ],
      perimeter: 1,
    };

    // result
    expect(sampleStrokeRing(flat, 0.5)).toEqual({ mid: { x: 1, y: 1 }, tangent: { x: 0, y: 0 }, vec: { x: 0, y: -1 } });
  });

  it('should move past an empty segment the distance falls on', () => {
    // mock
    const gap: TStrokeRing = {
      ...ring,
      cumulative: [0, 5],
      lengths: [0, 10],
      mids: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      outer: [
        { x: 0, y: -1 },
        { x: 0, y: -1 },
      ],
      perimeter: 20,
    };

    // result
    expect(sampleStrokeRing(gap, 2).tangent).toEqual({ x: 0, y: 0 });
  });
});
