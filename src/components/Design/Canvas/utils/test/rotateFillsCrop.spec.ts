// types
import { TImagePaint } from 'types/design/paint/types';

// utils
import { rotateFillsCrop } from '../rotateFillsCrop';

describe('rotateFillsCrop', () => {
  it('should return undefined when there are no fills', () => {
    expect(rotateFillsCrop(undefined, { x: 0, y: 0 }, 90)).toBeUndefined();
  });

  it('should return undefined when no fill has a stored crop', () => {
    const fills: TImagePaint[] = [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    expect(rotateFillsCrop(fills, { x: 0, y: 0 }, 90)).toBeUndefined();
  });

  it('should rotate the crop rect’s center around the pivot and add the delta to its own rotation', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const fills: TImagePaint[] = [{ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    const result = rotateFillsCrop(fills, { x: 0, y: 0 }, 90);
    const updatedCrop = (result?.[0] as TImagePaint).crop;

    // center (10,10) rotated 90° around the origin becomes (-10,10)
    expect(updatedCrop).toEqual({ height: 10, rotation: 90, width: 10, x: -15, y: 5 });
  });

  it('should leave non-image fills and image fills without a crop untouched', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const solid = { color: '#ff0000', opacity: 100, type: 'solid' } as const;
    const uncropped: TImagePaint = { opacity: 100, ref: 'image-2', rotation: 0, scaleMode: 'fill', type: 'image' };
    const cropped: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    const result = rotateFillsCrop([solid, uncropped, cropped], { x: 0, y: 0 }, 90);

    expect(result?.[0]).toEqual(solid);
    expect(result?.[1]).toEqual(uncropped);
    expect((result?.[2] as TImagePaint).crop).not.toEqual(crop);
  });

  it('should skip the fill at skipPaintIndex, treating it as if it had no crop', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const fills: TImagePaint[] = [{ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    const result = rotateFillsCrop(fills, { x: 0, y: 0 }, 90, 0);

    expect(result).toBeUndefined();
  });

  it('should only skip the given index, still rotating a crop on another fill', () => {
    const cropA = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const cropB = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const fillA: TImagePaint = { crop: cropA, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const fillB: TImagePaint = { crop: cropB, opacity: 100, ref: 'image-2', rotation: 0, scaleMode: 'fill', type: 'image' };

    const result = rotateFillsCrop([fillA, fillB], { x: 0, y: 0 }, 90, 0);

    expect((result?.[0] as TImagePaint).crop).toEqual(cropA);
    expect((result?.[1] as TImagePaint).crop).not.toEqual(cropB);
  });

  it('should round the crop rotation to two decimal places', () => {
    const crop = { height: 10, rotation: 0.001, width: 10, x: 5, y: 5 };
    const fills: TImagePaint[] = [{ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    const result = rotateFillsCrop(fills, { x: 0, y: 0 }, 33.336);

    expect((result?.[0] as TImagePaint).crop?.rotation).toBe(33.34);
  });
});
