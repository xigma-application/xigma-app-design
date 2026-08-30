// utils
import { getGroupLineChildChanges } from '../getGroupLineChildChanges';
import { getNextGroupChildPoint } from '../getNextGroupChildPoint';

describe('getGroupLineChildChanges', () => {
  it('should map both endpoints through nextPoint', () => {
    const nextPoint = getNextGroupChildPoint(
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 200, x: 0, y: 0 },
      { x: 1, y: 1 },
    );

    expect(getGroupLineChildChanges({ x1: 0, x2: 100, y1: 50, y2: 50 }, nextPoint)).toEqual({ x1: 0, x2: 200, y1: 50, y2: 50 });
  });
});
