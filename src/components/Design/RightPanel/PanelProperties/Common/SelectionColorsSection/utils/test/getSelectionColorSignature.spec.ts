// types
import { BlendMode } from 'types/design/enums';
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { getSelectionColorSignature } from '../getSelectionColorSignature';

describe('getSelectionColorSignature', () => {
  it('should build the same signature for two solid paints with the same color, opacity and blend mode', () => {
    // mock
    const first: TSolidPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
    const second: TSolidPaint = { color: '#FF0000', opacity: 100, type: 'solid' };

    // result
    expect(getSelectionColorSignature(first)).toBe(getSelectionColorSignature(second));
  });

  it('should treat an explicit normal blend mode the same as an omitted one', () => {
    // mock
    const first: TSolidPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
    const second: TSolidPaint = { blendMode: BlendMode.normal, color: '#ff0000', opacity: 100, type: 'solid' };

    // result
    expect(getSelectionColorSignature(first)).toBe(getSelectionColorSignature(second));
  });

  it('should build a different signature for a different blend mode', () => {
    // mock
    const first: TSolidPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
    const second: TSolidPaint = { blendMode: BlendMode.multiply, color: '#ff0000', opacity: 100, type: 'solid' };

    // result
    expect(getSelectionColorSignature(first)).not.toBe(getSelectionColorSignature(second));
  });

  it('should build a different signature for a different opacity', () => {
    // mock
    const first: TSolidPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
    const second: TSolidPaint = { color: '#ff0000', opacity: 50, type: 'solid' };

    // result
    expect(getSelectionColorSignature(first)).not.toBe(getSelectionColorSignature(second));
  });

  it('should build the same signature for two identical gradient paints', () => {
    // mock
    const gradient: TGradientPaint = {
      end: { x: 1, y: 1 },
      opacity: 100,
      start: { x: 0, y: 0 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    };

    // result
    expect(getSelectionColorSignature(gradient)).toBe(getSelectionColorSignature({ ...gradient }));
  });

  it('should build a different signature for a different gradient stop', () => {
    // mock
    const gradient: TGradientPaint = {
      end: { x: 1, y: 1 },
      opacity: 100,
      start: { x: 0, y: 0 },
      stops: [{ color: '#ffffff', opacity: 100, position: 0 }],
      type: 'gradient-linear',
    };
    const other: TGradientPaint = { ...gradient, stops: [{ color: '#000000', opacity: 100, position: 0 }] };

    // result
    expect(getSelectionColorSignature(gradient)).not.toBe(getSelectionColorSignature(other));
  });

  it('should build a different signature for a different radius ratio', () => {
    // mock
    const gradient: TGradientPaint = {
      end: { x: 1, y: 1 },
      opacity: 100,
      radiusRatio: 1,
      start: { x: 0, y: 0 },
      stops: [],
      type: 'gradient-radial',
    };
    const other: TGradientPaint = { ...gradient, radiusRatio: 2 };

    // result
    expect(getSelectionColorSignature(gradient)).not.toBe(getSelectionColorSignature(other));
  });

  it('should build a different signature for a different gradient type', () => {
    // mock
    const gradient: TGradientPaint = { end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' };
    const other: TGradientPaint = { ...gradient, type: 'gradient-radial' };

    // result
    expect(getSelectionColorSignature(gradient)).not.toBe(getSelectionColorSignature(other));
  });
});
