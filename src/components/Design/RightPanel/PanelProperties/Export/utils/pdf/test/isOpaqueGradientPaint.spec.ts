// types
import { TGradientPaint, TPaint } from 'types/design/paint/types';

// utils
import { isOpaqueGradientPaint } from '../isOpaqueGradientPaint';

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const gradient: TGradientPaint = {
  end: { x: 10, y: 10 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [
    { color: '#ff0000', opacity: 100, position: 0 },
    { color: '#0000ff', opacity: 100, position: 1 },
  ],
  type: 'gradient-linear',
};

describe('isOpaqueGradientPaint', () => {
  it('should allow any non-gradient paint regardless of opacity', () => {
    expect(isOpaqueGradientPaint(solid)).toBe(true);
  });

  it('should allow a gradient whose stops are all fully opaque', () => {
    expect(isOpaqueGradientPaint(gradient)).toBe(true);
  });

  it('should reject a gradient with any translucent stop', () => {
    expect(isOpaqueGradientPaint({ ...gradient, stops: [...gradient.stops, { color: '#00ff00', opacity: 50, position: 0.5 }] })).toBe(
      false,
    );
  });
});
