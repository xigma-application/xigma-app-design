// utils
import { getTouchedRectEdges } from '../getTouchedRectEdges';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('getTouchedRectEdges', () => {
  it('should return just the left edge for a point on the left edge midpoint', () => {
    expect(getTouchedRectEdges({ x: 0, y: 50 }, bounds, 0.5)).toEqual(new Set(['left']));
  });

  it('should return just the top edge for a point on the top edge midpoint', () => {
    expect(getTouchedRectEdges({ x: 50, y: 0 }, bounds, 0.5)).toEqual(new Set(['top']));
  });

  it('should return both touched edges for a corner', () => {
    expect(getTouchedRectEdges({ x: 0, y: 0 }, bounds, 0.5)).toEqual(new Set(['left', 'top']));
    expect(getTouchedRectEdges({ x: 100, y: 100 }, bounds, 0.5)).toEqual(new Set(['right', 'bottom']));
  });

  it('should return an empty set for an interior point far from every edge', () => {
    expect(getTouchedRectEdges({ x: 50, y: 50 }, bounds, 0.5)).toEqual(new Set());
  });

  it('should return an empty set for a point outside the rect entirely, even if it lines up with an edge coordinate', () => {
    // x=0 matches the left edge's x-coordinate, but y=200 is well past the bottom
    expect(getTouchedRectEdges({ x: 0, y: 200 }, bounds, 0.5)).toEqual(new Set());
  });

  it('should honor the tolerance', () => {
    expect(getTouchedRectEdges({ x: 0.4, y: 50 }, bounds, 0.5)).toEqual(new Set(['left']));
    expect(getTouchedRectEdges({ x: 0.6, y: 50 }, bounds, 0.5)).toEqual(new Set());
  });
});
