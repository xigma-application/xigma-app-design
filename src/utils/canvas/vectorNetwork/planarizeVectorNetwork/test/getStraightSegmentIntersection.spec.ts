// utils
import { getStraightSegmentIntersection } from '../getStraightSegmentIntersection';

describe('getStraightSegmentIntersection', () => {
  it('should find the crossing point and its t/u parameters when two segments genuinely cross', () => {
    // result
    expect(getStraightSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: -50 }, { x: 50, y: 50 })).toEqual({
      point: { x: 50, y: 0 },
      t: 0.5,
      u: 0.5,
    });
  });

  it('should return null when the two segments are parallel (zero denominator)', () => {
    // result
    expect(getStraightSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 10 }, { x: 100, y: 10 })).toBeNull();
  });

  it('should return null when the segments’ own lines cross outside either segment’s finite range', () => {
    // mock — these lines cross at (50,0), but the second "segment" only spans x in [200,300]
    // result
    expect(getStraightSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: -50 }, { x: 200, y: 50 })).toBeNull();
  });

  it('should return null when the crossing lands exactly on an endpoint (t or u === 0 or 1)', () => {
    // mock — crosses exactly at (0,0), the shared start of segment A
    // result
    expect(getStraightSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: -50 }, { x: 0, y: 50 })).toBeNull();
  });
});
