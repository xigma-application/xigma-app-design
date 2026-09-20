// types
import { TMaskRenderer } from '../types';

// utils
import { getLayerBlurRadius } from '../getLayerBlurRadius';

const createRenderer = (zoom: number, drawingBufferWidth: number, canvasWidth: number): TMaskRenderer =>
  ({ context: { canvasWidth, viewport: { x: 0, y: 0, zoom } }, gl: { drawingBufferWidth } }) as unknown as TMaskRenderer;

describe('getLayerBlurRadius', () => {
  it('should scale the blur by the zoom and the device pixel ratio', () => {
    // result
    expect(getLayerBlurRadius(createRenderer(2, 2000, 1000), 4)).toBe(16);
  });

  it('should clamp to the maximum blur radius', () => {
    // result
    expect(getLayerBlurRadius(createRenderer(10, 1000, 1000), 50)).toBe(32);
  });

  it('should fall back to a pixel ratio of 1 for a zero-width canvas', () => {
    // result
    expect(getLayerBlurRadius(createRenderer(1, 0, 0), 5)).toBe(5);
  });
});
