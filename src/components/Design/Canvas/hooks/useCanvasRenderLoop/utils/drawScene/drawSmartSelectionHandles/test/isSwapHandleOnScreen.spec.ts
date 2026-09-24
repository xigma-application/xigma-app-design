import { isSwapHandleOnScreen } from '../isSwapHandleOnScreen';

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('isSwapHandleOnScreen', () => {
  it('should be true for a handle inside the canvas', () => {
    // result
    expect(isSwapHandleOnScreen(100, 100, 200, 200, VIEWPORT)).toBe(true);
  });

  it('should be true for a handle just past the edge that its ring still reaches into the canvas', () => {
    // result
    expect(isSwapHandleOnScreen(-10, 100, 200, 200, VIEWPORT)).toBe(true);
  });

  it.each([
    ['left of', -20, 100],
    ['above', 100, -20],
    ['right of', 230, 100],
    ['below', 100, 230],
  ])('should be false for a handle entirely %s the canvas', (_, x, y) => {
    // result
    expect(isSwapHandleOnScreen(x, y, 200, 200, VIEWPORT)).toBe(false);
  });

  it('should account for zoom and pan when converting to screen space', () => {
    // result
    expect(isSwapHandleOnScreen(50, 50, 200, 200, { x: 300, y: 0, zoom: 2 })).toBe(false);
    expect(isSwapHandleOnScreen(50, 50, 200, 200, { x: -50, y: 0, zoom: 2 })).toBe(true);
  });
});
