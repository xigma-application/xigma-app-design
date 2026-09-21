// types
import { TPaint } from 'types/design/paint/types';

// utils
import { isSelectionColorPaint } from '../isSelectionColorPaint';

describe('isSelectionColorPaint', () => {
  it('should accept a solid paint', () => {
    // mock
    const paint: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };

    // result
    expect(isSelectionColorPaint(paint)).toBe(true);
  });

  it('should accept every gradient paint type', () => {
    // mock
    const types: TPaint['type'][] = ['gradient-linear', 'gradient-radial', 'gradient-angular', 'gradient-diamond'];

    // result
    types.forEach((type) => {
      const paint = { end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type } as TPaint;

      expect(isSelectionColorPaint(paint)).toBe(true);
    });
  });

  it('should reject an image, video and pattern paint', () => {
    // mock
    const imagePaint: TPaint = { opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const videoPaint: TPaint = { opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'video' };
    const patternPaint: TPaint = {
      alignmentIndex: 0,
      direction: 'horizontal',
      offsetX: 0,
      offsetY: 0,
      opacity: 100,
      scale: 1,
      spacingX: 0,
      spacingY: 0,
      tileType: 'rectangular',
      type: 'pattern',
    };

    // result
    expect(isSelectionColorPaint(imagePaint)).toBe(false);
    expect(isSelectionColorPaint(videoPaint)).toBe(false);
    expect(isSelectionColorPaint(patternPaint)).toBe(false);
  });
});
