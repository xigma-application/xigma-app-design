// utils
import { getVisibleCurve } from '../getVisibleCurve';

describe('getVisibleCurve', () => {
  it('should return every point when none reaches the top edge', () => {
    const points = [
      { s: 0, v: 10 },
      { s: 50, v: 20 },
    ];

    expect(getVisibleCurve(points)).toEqual(points);
  });

  it('should cut the curve at the first point that reaches the top edge', () => {
    const points = [
      { s: 0, v: 10 },
      { s: 50, v: 100 },
      { s: 100, v: 100 },
    ];

    expect(getVisibleCurve(points)).toEqual([
      { s: 0, v: 10 },
      { s: 50, v: 100 },
    ]);
  });
});
