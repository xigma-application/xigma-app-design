// utils
import { getPositivelyWoundPolygon } from '../getPositivelyWoundPolygon';

const square = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

describe('getPositivelyWoundPolygon', () => {
  it('should keep a positively wound polygon as it is', () => {
    // result
    expect(getPositivelyWoundPolygon(square)).toBe(square);
  });

  it('should reverse a negatively wound polygon', () => {
    // result
    expect(getPositivelyWoundPolygon([...square].reverse())).toEqual(square);
  });
});
