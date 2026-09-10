// utils
import { computeGridTrackDropIndex } from '../computeGridTrackDropIndex';

const rect = (top: number, height = 20): DOMRect => ({ height, top }) as DOMRect;

describe('computeGridTrackDropIndex', () => {
  it('should count the rows whose midpoint sits above the pointer', () => {
    const rects = [rect(0), rect(20), rect(40)];

    expect(computeGridTrackDropIndex(rects, -5)).toBe(0);
    expect(computeGridTrackDropIndex(rects, 25)).toBe(1);
    expect(computeGridTrackDropIndex(rects, 45)).toBe(2);
    expect(computeGridTrackDropIndex(rects, 100)).toBe(3);
  });

  it('should ignore rows that never registered an element', () => {
    expect(computeGridTrackDropIndex([null, rect(20), null], 100)).toBe(1);
  });
});
