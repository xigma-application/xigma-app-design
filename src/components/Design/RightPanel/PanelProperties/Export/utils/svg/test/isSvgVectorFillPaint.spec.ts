// types
import { BlendMode } from 'types/design/enums';
import { TImageAdjustments } from 'types/design/paint/types';

// utils
import { isSvgVectorFillPaint } from '../isSvgVectorFillPaint';

const defaultAdjustments: TImageAdjustments = {
  contrast: 0,
  exposure: 0,
  highlights: 0,
  saturation: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
};

describe('isSvgVectorFillPaint', () => {
  it('should allow a solid paint (delegates to isSvgVectorPaint)', () => {
    expect(isSvgVectorFillPaint({ color: '#ff0000', opacity: 100, type: 'solid' })).toBe(true);
  });

  it('should reject an angular gradient (delegates to isSvgVectorPaint)', () => {
    expect(isSvgVectorFillPaint({ end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-angular' })).toBe(
      false,
    );
  });

  it('should allow a simple image paint with a ref and default adjustments', () => {
    expect(isSvgVectorFillPaint({ opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' })).toBe(true);
    expect(
      isSvgVectorFillPaint({ adjustments: defaultAdjustments, opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' }),
    ).toBe(true);
  });

  it('should allow a simple video paint (no adjustments field on that type at all)', () => {
    expect(isSvgVectorFillPaint({ opacity: 100, ref: 'v', rotation: 0, scaleMode: 'fill', type: 'video' })).toBe(true);
  });

  it('should reject an image paint with no ref', () => {
    expect(isSvgVectorFillPaint({ opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' })).toBe(false);
  });

  it('should reject an image paint with any non-default color adjustment', () => {
    expect(
      isSvgVectorFillPaint({
        adjustments: { ...defaultAdjustments, contrast: 5 },
        opacity: 100,
        ref: 'i',
        rotation: 0,
        scaleMode: 'fill',
        type: 'image',
      }),
    ).toBe(false);
  });

  it('should reject an image paint with a non-normal blend mode', () => {
    expect(
      isSvgVectorFillPaint({ blendMode: BlendMode.multiply, opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' }),
    ).toBe(false);
    expect(
      isSvgVectorFillPaint({ blendMode: BlendMode.normal, opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' }),
    ).toBe(true);
  });

  it('should reject a pattern paint', () => {
    expect(
      isSvgVectorFillPaint({
        alignmentIndex: 0,
        direction: 'horizontal',
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        spacingX: 0,
        spacingY: 0,
        tileType: 'grid',
        type: 'pattern',
      } as never),
    ).toBe(false);
  });

  it('should allow a hidden image paint regardless of any other invalid state (vacuous, never drawn)', () => {
    expect(
      isSvgVectorFillPaint({
        adjustments: { ...defaultAdjustments, contrast: 5 },
        opacity: 100,
        ref: '',
        rotation: 0,
        scaleMode: 'fill',
        type: 'image',
        visible: false,
      }),
    ).toBe(true);
  });
});
