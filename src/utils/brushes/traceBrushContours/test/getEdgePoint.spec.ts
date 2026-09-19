// utils
import { getEdgePoint } from '../getEdgePoint';
import { createStrip } from './stripFixtures';

const strip = createStrip(4, 3, (column) => column >= 1);

describe('getEdgePoint', () => {
  it('should put the point where the value crosses the threshold, in strip coordinates', () => {
    // action
    const point = getEdgePoint(strip, [1, 1], [2, 1], 'h1,1');

    // result
    expect(point.key).toBe('h1,1');
    expect(point.x).toBeCloseTo(0.5);
    expect(point.y).toBeCloseTo(0);
  });

  it('should use the middle when both ends have the same value', () => {
    // result
    expect(getEdgePoint(strip, [2, 1], [3, 1], 'h2,1').x).toBeCloseTo(1.5);
  });
});
