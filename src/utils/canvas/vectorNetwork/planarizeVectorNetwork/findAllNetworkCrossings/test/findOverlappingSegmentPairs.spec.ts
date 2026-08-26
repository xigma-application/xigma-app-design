// utils
import { findOverlappingSegmentPairs } from '../findOverlappingSegmentPairs';

describe('findOverlappingSegmentPairs', () => {
  it('should return no pairs for a single box', () => {
    expect(findOverlappingSegmentPairs([{ index: 0, maxX: 10, maxY: 10, minX: 0, minY: 0 }])).toEqual([]);
  });

  it('should pair two overlapping boxes', () => {
    const boxes = [
      { index: 0, maxX: 10, maxY: 10, minX: 0, minY: 0 },
      { index: 1, maxX: 15, maxY: 15, minX: 5, minY: 5 },
    ];

    expect(findOverlappingSegmentPairs(boxes)).toEqual([[0, 1]]);
  });

  it('should not pair two boxes with a real gap between them', () => {
    const boxes = [
      { index: 0, maxX: 10, maxY: 10, minX: 0, minY: 0 },
      { index: 1, maxX: 30, maxY: 10, minX: 20, minY: 0 },
    ];

    expect(findOverlappingSegmentPairs(boxes)).toEqual([]);
  });

  it('should report a pair only once even when both boxes span several shared cells', () => {
    // mock — two small, far-apart boxes keep the derived cell size small, so the two big overlapping
    // boxes below span (and share) several cells
    const boxes = [
      { index: 0, maxX: 1, maxY: 1, minX: 0, minY: 0 },
      { index: 1, maxX: 101, maxY: 101, minX: 100, minY: 100 },
      { index: 2, maxX: 60, maxY: 60, minX: 0, minY: 0 },
      { index: 3, maxX: 65, maxY: 65, minX: 5, minY: 5 },
    ];

    const pairs = findOverlappingSegmentPairs(boxes);

    expect(pairs.filter(([a, b]) => a === 2 && b === 3)).toHaveLength(1);
  });
});
