// types
import { TImagePaint } from 'types/design/paint/types';

// utils
import { scaleFillsCrop, TScaleFillsCropTransform } from '../scaleFillsCrop';

const identityTransform: TScaleFillsCropTransform = { newCenterX: 0, newCenterY: 0, oldCenterX: 0, oldCenterY: 0, scaleX: 1, scaleY: 1 };

describe('scaleFillsCrop', () => {
  it('should return undefined when there are no fills', () => {
    expect(scaleFillsCrop(undefined, identityTransform)).toBeUndefined();
  });

  it('should return undefined when no fill has a stored crop', () => {
    const fills: TImagePaint[] = [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    expect(scaleFillsCrop(fills, identityTransform)).toBeUndefined();
  });

  it('should scale the crop rect’s size and re-center it around the new center', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const fills: TImagePaint[] = [{ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];
    const transform: TScaleFillsCropTransform = { newCenterX: 20, newCenterY: 20, oldCenterX: 10, oldCenterY: 10, scaleX: 2, scaleY: 2 };

    const result = scaleFillsCrop(fills, transform);
    const updatedCrop = (result?.[0] as TImagePaint).crop;

    // crop center was (10,10) == oldCenter, so it maps straight onto the new center, doubled in size
    expect(updatedCrop).toEqual({ height: 20, rotation: 0, width: 20, x: 10, y: 10 });
  });

  it('should scale width and height independently', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 0, y: 0 };
    const fills: TImagePaint[] = [{ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];
    const transform: TScaleFillsCropTransform = { newCenterX: 5, newCenterY: 5, oldCenterX: 5, oldCenterY: 5, scaleX: 2, scaleY: 3 };

    const result = scaleFillsCrop(fills, transform);
    const updatedCrop = (result?.[0] as TImagePaint).crop;

    expect(updatedCrop).toEqual({ height: 30, rotation: 0, width: 20, x: -5, y: -10 });
  });

  it('should leave non-image fills and image fills without a crop untouched', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const solid = { color: '#00ff00', opacity: 100, type: 'solid' } as const;
    const uncropped: TImagePaint = { opacity: 100, ref: 'image-2', rotation: 0, scaleMode: 'fill', type: 'image' };
    const cropped: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const transform: TScaleFillsCropTransform = { newCenterX: 20, newCenterY: 20, oldCenterX: 10, oldCenterY: 10, scaleX: 2, scaleY: 2 };

    const result = scaleFillsCrop([solid, uncropped, cropped], transform);

    expect(result?.[0]).toEqual(solid);
    expect(result?.[1]).toEqual(uncropped);
    expect((result?.[2] as TImagePaint).crop).not.toEqual(crop);
  });

  it('should skip the fill at skipPaintIndex, treating it as if it had no crop', () => {
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const fills: TImagePaint[] = [{ crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    const result = scaleFillsCrop(fills, identityTransform, 0);

    expect(result).toBeUndefined();
  });

  it('should only skip the given index, still scaling a crop on another fill', () => {
    const cropA = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const cropB = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const fillA: TImagePaint = { crop: cropA, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const fillB: TImagePaint = { crop: cropB, opacity: 100, ref: 'image-2', rotation: 0, scaleMode: 'fill', type: 'image' };
    const transform: TScaleFillsCropTransform = { newCenterX: 20, newCenterY: 20, oldCenterX: 10, oldCenterY: 10, scaleX: 2, scaleY: 2 };

    const result = scaleFillsCrop([fillA, fillB], transform, 0);

    expect((result?.[0] as TImagePaint).crop).toEqual(cropA);
    expect((result?.[1] as TImagePaint).crop).not.toEqual(cropB);
  });
});
