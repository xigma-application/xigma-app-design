// utils
import { hasNearbyContactEdge } from '../hasNearbyContactEdge';

const ACTIVE = { height: 10, width: 10, x: 100, y: 100 };

describe('hasNearbyContactEdge', () => {
  it.each([
    ['right edge to left edge', { height: 10, width: 10, x: 110, y: 300 }],
    ['left edge to right edge', { height: 10, width: 10, x: 90, y: 300 }],
    ['bottom edge to top edge', { height: 10, width: 10, x: 300, y: 110 }],
    ['top edge to bottom edge', { height: 10, width: 10, x: 300, y: 90 }],
    ['top edges', { height: 50, width: 10, x: 300, y: 100 }],
    ['bottom edges', { height: 10, width: 10, x: 300, y: 100 }],
    ['left edges', { height: 10, width: 50, x: 100, y: 300 }],
    ['right edges', { height: 10, width: 10, x: 100, y: 300 }],
  ])('should be true when the %s are within tolerance', (_, candidate) => {
    // result
    expect(hasNearbyContactEdge(ACTIVE, candidate)).toBe(true);
  });

  it('should be false when no pair of edges is close', () => {
    // result
    expect(hasNearbyContactEdge(ACTIVE, { height: 30, width: 40, x: 400, y: 500 })).toBe(false);
  });
});
