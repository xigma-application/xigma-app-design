// utils
import { getInitialImageFillModeFromPaint } from '../getInitialImageFillModeFromPaint';

describe('getInitialImageFillModeFromPaint', () => {
  it('should return undefined for a non-image paint', () => {
    expect(getInitialImageFillModeFromPaint({ color: '#ff0000', opacity: 100, type: 'solid' })).toBeUndefined();
  });

  it('should return crop when the paint already has a stored crop rect', () => {
    const paint = {
      crop: { height: 10, rotation: 0, width: 10, x: 0, y: 0 },
      opacity: 100,
      ref: 'asset-1',
      rotation: 0,
      scaleMode: 'fill' as const,
      type: 'image' as const,
    };

    expect(getInitialImageFillModeFromPaint(paint)).toBe('crop');
  });

  it('should return fit for a fit-scaled image without a stored crop', () => {
    expect(getInitialImageFillModeFromPaint({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fit', type: 'image' })).toBe('fit');
  });

  it('should return tile for a tile-scaled image without a stored crop', () => {
    expect(getInitialImageFillModeFromPaint({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'tile', type: 'image' })).toBe('tile');
  });

  it('should return fill for a fill-scaled image without a stored crop', () => {
    expect(getInitialImageFillModeFromPaint({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' })).toBe('fill');
  });

  it('should fall back to fill for the unused stretch scale mode', () => {
    expect(getInitialImageFillModeFromPaint({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'stretch', type: 'image' })).toBe(
      'fill',
    );
  });

  it('should return fill for a fill-scaled video paint without a stored crop', () => {
    expect(getInitialImageFillModeFromPaint({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'video' })).toBe('fill');
  });
});
