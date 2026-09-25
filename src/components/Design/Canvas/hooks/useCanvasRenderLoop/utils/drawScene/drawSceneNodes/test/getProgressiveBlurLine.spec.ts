// types
import { TMaskRenderer } from '../types';
import { TProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';

// utils
import { getProgressiveBlurLine } from '../getProgressiveBlurLine';

const renderer = (canvasWidth: number): TMaskRenderer =>
  ({
    context: { canvasWidth, devicePixelHeight: 200, devicePixelWidth: 200, viewport: { x: 0, y: 0, zoom: 1 } },
    gl: {},
  }) as unknown as TMaskRenderer;

const progressive = { end: { x: 1, y: 1 }, start: { x: 0, y: 0 } } as TProgressiveBlur;

describe('getProgressiveBlurLine', () => {
  it('should map the blur start and end to device pixels with a bottom-left origin', () => {
    // result
    expect(getProgressiveBlurLine(renderer(100), { height: 10, width: 20, x: 5, y: 5 }, 0, progressive)).toEqual([10, 190, 50, 170]);
  });

  it('should rotate the line with the node and use a unit ratio on a zero-width canvas', () => {
    // before
    const [startX, startY, endX, endY] = getProgressiveBlurLine(renderer(0), { height: 10, width: 10, x: 0, y: 0 }, 180, progressive);

    // result
    expect(startX).toBeCloseTo(10);
    expect(startY).toBeCloseTo(190);
    expect(endX).toBeCloseTo(0);
    expect(endY).toBeCloseTo(200);
  });
});
