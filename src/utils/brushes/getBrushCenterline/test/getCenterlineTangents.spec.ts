// utils
import { getCenterlineTangents } from '../getCenterlineTangents';

describe('getCenterlineTangents', () => {
  it('should be the unit direction of travel', () => {
    // action
    const tangents = getCenterlineTangents(Array.from({ length: 10 }, (_, index) => ({ x: index, y: index })));

    // result
    expect(tangents[5].x).toBeCloseTo(Math.SQRT1_2);
    expect(tangents[5].y).toBeCloseTo(Math.SQRT1_2);
  });

  it('should not divide by zero for a single point', () => {
    // result
    expect(getCenterlineTangents([{ x: 1, y: 1 }])).toEqual([{ x: 0, y: 0 }]);
  });
});
