// utils
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getStampCenter } from '../getStampCenter';

const sample = { mid: { x: 10, y: 20 }, tangent: { x: 1, y: 0 }, vec: { x: 0, y: -5 } };

describe('getStampCenter', () => {
  it('should stay on the path without Wiggle', () => {
    // result
    expect(getStampCenter(sample, 0, 10, createSeededRandom('a'))).toEqual({ x: 10, y: 20 });
  });

  it('should move away from the path in both axes with Wiggle', () => {
    // action
    const center = getStampCenter(sample, 200, 10, createSeededRandom('a'));

    // result
    expect(center.x).not.toBe(10);
    expect(center.y).not.toBe(20);
  });
});
