// utils
import { getInitialPatternFromPaint } from '../getInitialPatternFromPaint';

describe('getInitialPatternFromPaint', () => {
  it('should pick the pattern fields off a pattern paint', () => {
    expect(
      getInitialPatternFromPaint({
        alignmentIndex: 4,
        direction: 'vertical',
        opacity: 100,
        scale: 150,
        spacingX: 10,
        spacingY: 20,
        tileType: 'rectangular',
        type: 'pattern',
      }),
    ).toEqual({
      alignmentIndex: 4,
      direction: 'vertical',
      scale: 150,
      spacingX: 10,
      spacingY: 20,
      tileType: 'rectangular',
    });
  });

  it('should return undefined for a non-pattern paint', () => {
    expect(getInitialPatternFromPaint({ color: '#ff0000', opacity: 100, type: 'solid' })).toBeUndefined();
  });
});
