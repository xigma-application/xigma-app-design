// utils
import { getResizeFactors } from '../getResizeFactors';

describe('getResizeFactors', () => {
  it('should scale from the opposite edge when dragging the east handle', () => {
    // result
    expect(getResizeFactors('e', { height: 10, width: 10, x: 0, y: 0 }, { x: 20, y: 5 })).toMatchObject({ scaleX: 2, scaleY: 1 });
  });

  it('should flip when dragged past the opposite edge', () => {
    // before
    const factors = getResizeFactors('se', { height: 10, width: 10, x: 0, y: 0 }, { x: -10, y: 20 });

    // result
    expect(factors.scaleX).toBe(-1);
    expect(factors.scaleY).toBe(2);
    expect(factors.anchors).toEqual({ x: 0, y: 0 });
  });
});
