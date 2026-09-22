// types
import { TImagePaint } from 'types/design/paint/types';

// utils
import { getSvgImagePlacement } from '../getSvgImagePlacement';

const boxRect = { height: 40, width: 60, x: 5, y: 10 };

const paint = (overrides: Partial<TImagePaint> = {}): TImagePaint => ({
  opacity: 100,
  ref: 'i',
  rotation: 0,
  scaleMode: 'fill',
  ...overrides,
  type: 'image',
});

describe('getSvgImagePlacement', () => {
  it('should place a cover ("fill") paint at the box rect with a slice preserveAspectRatio', () => {
    expect(getSvgImagePlacement(paint({ scaleMode: 'fill' }), boxRect, 15)).toEqual({
      preserveAspectRatio: 'xMidYMid slice',
      rect: boxRect,
      rotation: 15,
    });
  });

  it('should place a contain ("fit") paint at the box rect with a meet preserveAspectRatio', () => {
    expect(getSvgImagePlacement(paint({ scaleMode: 'fit' }), boxRect, 15)).toEqual({
      preserveAspectRatio: 'xMidYMid meet',
      rect: boxRect,
      rotation: 15,
    });
  });

  it('should use the crop rect and its own rotation, ignoring the box rotation, with no preserveAspectRatio stretching', () => {
    const crop = { height: 12, rotation: 30, width: 8, x: 1, y: 2 };

    expect(getSvgImagePlacement(paint({ crop, scaleMode: 'fill' }), boxRect, 15)).toEqual({
      preserveAspectRatio: 'none',
      rect: crop,
      rotation: 30,
    });
  });

  it('should let a crop rect win even when scaleMode is tile', () => {
    const crop = { height: 12, rotation: 30, width: 8, x: 1, y: 2 };

    expect(getSvgImagePlacement(paint({ crop, scaleMode: 'tile' }), boxRect, 15).rect).toBe(crop);
  });
});
