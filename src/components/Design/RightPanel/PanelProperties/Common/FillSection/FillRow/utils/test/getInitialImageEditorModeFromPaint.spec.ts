// utils
import { getInitialImageEditorModeFromPaint } from '../getInitialImageEditorModeFromPaint';

describe('getInitialImageEditorModeFromPaint', () => {
  it('should return position for a non-image paint', () => {
    expect(getInitialImageEditorModeFromPaint({ color: '#ff0000', opacity: 100, type: 'solid' })).toBe('position');
  });

  it('should return tile for a tile-scaled image, even if a stale crop rect is still stored', () => {
    const paint = {
      crop: { height: 10, rotation: 0, width: 10, x: 0, y: 0 },
      opacity: 100,
      ref: 'asset-1',
      rotation: 0,
      scaleMode: 'tile' as const,
      type: 'image' as const,
    };

    expect(getInitialImageEditorModeFromPaint(paint)).toBe('tile');
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

    expect(getInitialImageEditorModeFromPaint(paint)).toBe('crop');
  });

  it('should return position for a fill-scaled image without a stored crop', () => {
    expect(getInitialImageEditorModeFromPaint({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' })).toBe(
      'position',
    );
  });

  it('should return crop for a video paint with a stored crop rect', () => {
    const paint = {
      crop: { height: 10, rotation: 0, width: 10, x: 0, y: 0 },
      opacity: 100,
      ref: 'asset-1',
      rotation: 0,
      scaleMode: 'fill' as const,
      type: 'video' as const,
    };

    expect(getInitialImageEditorModeFromPaint(paint)).toBe('crop');
  });
});
