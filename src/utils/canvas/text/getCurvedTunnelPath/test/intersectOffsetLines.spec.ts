// utils
import { intersectOffsetLines } from '../intersectOffsetLines';

describe('intersectOffsetLines', () => {
  it('should return the true crossing point of two non-parallel lines', () => {
    // mock — line A: y=0 (through origin, running along +x); line B: x=5 (through (5,-5), running along +y)
    const point = intersectOffsetLines({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: -5 }, { x: 0, y: 1 });

    // result
    expect(point).toEqual({ x: 5, y: 0 });
  });

  it('should return null for two lines running in the same direction', () => {
    // result
    expect(intersectOffsetLines({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 10 }, { x: 1, y: 0 })).toBeNull();
  });

  it('should return null for a near-180° fold instead of an unbounded point (the hairpin case)', () => {
    // mock — directions point almost exactly opposite each other but on parallel tracks; left
    // unnormalized this used to have a tiny-but-nonzero denominator and shoot the miter out to an
    // absurd, effectively unbounded point instead of being caught as degenerate
    const point = intersectOffsetLines({ x: 0, y: 0 }, { x: 1, y: 0.0001 }, { x: 0, y: 10 }, { x: -1, y: 0.0001 });

    // result
    expect(point).toBeNull();
  });

  it('should return null when either direction has (near) zero length', () => {
    // result
    expect(intersectOffsetLines({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 10 }, { x: 1, y: 0 })).toBeNull();
  });
});
