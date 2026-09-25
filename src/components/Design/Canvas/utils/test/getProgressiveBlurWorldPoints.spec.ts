// types
import { TEffect, TRectangleNode } from 'types/design/types';

// utils
import { getProgressiveBlurWorldPoints } from '../getProgressiveBlurWorldPoints';

vi.mock('utils/design/effects/getProgressiveBlur', () => ({
  getProgressiveBlur: (): unknown => ({ end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } }),
}));

describe('getProgressiveBlurWorldPoints', () => {
  it('should place the blur start and end on the node in world space', () => {
    // mock
    const node = { height: 10, rotation: 0, width: 20, x: 5, y: 5 } as TRectangleNode;

    // result
    expect(getProgressiveBlurWorldPoints(node, {} as TEffect)).toEqual({ end: { x: 25, y: 10 }, start: { x: 5, y: 10 } });
  });

  it('should rotate the points with the node', () => {
    // mock
    const node = { height: 10, rotation: 180, width: 20, x: 0, y: 0 } as TRectangleNode;

    // before
    const { start } = getProgressiveBlurWorldPoints(node, {} as TEffect);

    // result
    expect(start.x).toBeCloseTo(20);
    expect(start.y).toBeCloseTo(5);
  });
});
