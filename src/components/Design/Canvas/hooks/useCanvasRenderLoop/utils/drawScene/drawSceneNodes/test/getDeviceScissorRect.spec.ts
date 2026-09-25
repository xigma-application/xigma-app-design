// types
import { TMaskRenderer } from '../types';

// utils
import { getDeviceScissorRect } from '../getDeviceScissorRect';

const renderer = (canvasWidth = 100): TMaskRenderer =>
  ({
    context: { canvasWidth, devicePixelHeight: 200, devicePixelWidth: 200, viewport: { x: 0, y: 0, zoom: 1 } },
    gl: {},
  }) as unknown as TMaskRenderer;

const square = (x: number, y: number, size: number): { x: number; y: number }[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];

describe('getDeviceScissorRect', () => {
  it('should convert the corners to a device-pixel rect with the margin, flipped to the bottom-left origin', () => {
    // result
    expect(getDeviceScissorRect(renderer(), square(10, 10, 20), 2)).toEqual({
      clipped: false,
      height: 44,
      originX: 18,
      originY: 138,
      rawHeight: 44,
      rawWidth: 44,
      width: 44,
      x: 18,
      y: 138,
    });
  });

  it('should clip a rect reaching past the device edges and remember the margin', () => {
    // result
    expect(getDeviceScissorRect(renderer(), square(-10, -10, 20), 2)).toEqual({
      clipped: true,
      height: 22,
      margin: 2,
      originX: -22,
      originY: 178,
      rawHeight: 44,
      rawWidth: 44,
      width: 22,
      x: 0,
      y: 178,
    });
  });

  it('should report a rect fully outside the device as offscreen', () => {
    // result
    expect(getDeviceScissorRect(renderer(), square(500, 500, 10), 0)).toEqual({ height: 0, offscreen: true, width: 0, x: 0, y: 0 });
  });

  it('should use a unit pixel ratio on a zero-width canvas', () => {
    // result
    expect(getDeviceScissorRect(renderer(0), square(10, 10, 20), 0)).toMatchObject({ width: 20, x: 10 });
  });
});
