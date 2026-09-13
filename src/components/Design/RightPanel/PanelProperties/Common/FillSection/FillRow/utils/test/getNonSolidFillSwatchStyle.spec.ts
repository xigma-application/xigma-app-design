// utils
import { getNonSolidFillSwatchStyle } from '../getNonSolidFillSwatchStyle';

describe('getNonSolidFillSwatchStyle', () => {
  it('should build a CSS gradient background derived from the stops and axis', () => {
    const style = getNonSolidFillSwatchStyle({
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    });

    expect(style).toHaveProperty('background');
  });

  it('should fall back to a neutral background for an image paint', () => {
    expect(getNonSolidFillSwatchStyle({ opacity: 100, ref: 'image-1', scaleMode: 'fill', type: 'image' })).toEqual({
      background: '#000000',
    });
  });
});
