// utils
import { getLoopArcLengthPositions } from '../getLoopArcLengthPositions';

describe('getLoopArcLengthPositions', () => {
  it('should return the cumulative arc-length fraction of each point around a closed square loop', () => {
    // before
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];

    // action
    const result = getLoopArcLengthPositions(points);

    // result
    expect(result).toEqual([0, 0.25, 0.5, 0.75]);
  });

  it('should account for uneven segment lengths around the loop', () => {
    // before
    const points = [
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 10 },
      { x: 0, y: 10 },
    ];

    // action
    const result = getLoopArcLengthPositions(points);

    // result
    expect(result).toEqual([0, 0.375, 0.5, 0.875]);
  });

  it('should return all zeros for a degenerate loop with no perimeter', () => {
    // before
    const points = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ];

    // action
    const result = getLoopArcLengthPositions(points);

    // result
    expect(result).toEqual([0, 0]);
  });
});
