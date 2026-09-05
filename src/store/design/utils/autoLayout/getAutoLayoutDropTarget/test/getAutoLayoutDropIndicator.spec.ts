// utils
import { getAutoLayoutDropIndicator } from '../getAutoLayoutDropIndicator';

describe('getAutoLayoutDropIndicator', () => {
  it('should build a horizontal thin bar (height = thickness) spanning the dragged item’s width, for a vertical frame', () => {
    // action
    const indicator = getAutoLayoutDropIndicator(
      false,
      { height: 200, width: 200, x: 0, y: 0 },
      { height: 20, width: 30 },
      { x: 50, y: 50 },
    );

    // result
    expect(indicator).toEqual({ height: 3, width: 30, x: 50, y: 50 });
  });

  it('should build a vertical thin bar (width = thickness) spanning the dragged item’s height, for a horizontal frame', () => {
    // action
    const indicator = getAutoLayoutDropIndicator(
      true,
      { height: 100, width: 200, x: 0, y: 0 },
      { height: 40, width: 20 },
      { x: 10, y: 10 },
    );

    // result
    expect(indicator).toEqual({ height: 40, width: 3, x: 10, y: 10 });
  });

  it('should clamp the indicator to the minimum gap relative to the frame’s own edge, not the canvas origin', () => {
    // action — a frame that itself sits away from the canvas origin, indicator flush with it
    const indicator = getAutoLayoutDropIndicator(
      false,
      { height: 200, width: 200, x: 100, y: 300 },
      { height: 20, width: 30 },
      { x: 100, y: 300 },
    );

    // result
    expect(indicator).toMatchObject({ x: 102, y: 302 });
  });
});
