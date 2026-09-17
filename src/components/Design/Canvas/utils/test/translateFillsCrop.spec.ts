// types
import { TImagePaint } from 'types/design/paint/types';

// utils
import { translateFillsCrop } from '../translateFillsCrop';

describe('translateFillsCrop', () => {
  it('should return undefined when there are no fills', () => {
    expect(translateFillsCrop(undefined, 5, 5)).toBeUndefined();
  });

  it('should return undefined when no fill has a stored crop', () => {
    const fills: TImagePaint[] = [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    expect(translateFillsCrop(fills, 5, 5)).toBeUndefined();
  });

  it('should offset the crop rect’s x/y by the given delta, leaving its size and rotation untouched', () => {
    const crop = { height: 10, rotation: 15, width: 20, x: 5, y: 5 };
    const fills: TImagePaint[] = [{ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    const result = translateFillsCrop(fills, 3, -4);

    expect((result?.[0] as TImagePaint).crop).toEqual({ height: 10, rotation: 15, width: 20, x: 8, y: 1 });
  });

  it('should leave non-image fills and image fills without a crop untouched', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const solid = { color: '#0000ff', opacity: 100, type: 'solid' } as const;
    const uncropped: TImagePaint = { opacity: 100, ref: 'image-2', rotation: 0, scaleMode: 'fill', type: 'image' };
    const cropped: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    const result = translateFillsCrop([solid, uncropped, cropped], 5, 5);

    expect(result?.[0]).toEqual(solid);
    expect(result?.[1]).toEqual(uncropped);
    expect((result?.[2] as TImagePaint).crop).toEqual({ ...crop, x: 10, y: 10 });
  });

  it('should skip the fill at skipPaintIndex, treating it as if it had no crop', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const fills: TImagePaint[] = [{ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    const result = translateFillsCrop(fills, 5, 5, 0);

    expect(result).toBeUndefined();
  });

  it('should only skip the given index, still translating a crop on another fill', () => {
    const cropA = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const cropB = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const fillA: TImagePaint = { crop: cropA, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const fillB: TImagePaint = { crop: cropB, opacity: 100, ref: 'image-2', rotation: 0, scaleMode: 'fill', type: 'image' };

    const result = translateFillsCrop([fillA, fillB], 5, 5, 0);

    expect((result?.[0] as TImagePaint).crop).toEqual(cropA);
    expect((result?.[1] as TImagePaint).crop).toEqual({ ...cropB, x: 10, y: 10 });
  });
});
