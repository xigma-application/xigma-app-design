// types
import { TImagePaint } from 'types/design/paint/types';

// utils
import { getEffectiveImageSize } from '../getEffectiveImageSize';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('getEffectiveImageSize', () => {
  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should return undefined when the image size has not loaded yet', () => {
    // result
    expect(getEffectiveImageSize(paint)).toBeUndefined();
  });

  it('should return the natural size unchanged for an unrotated image', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 200, width: 400 });

    // result
    expect(getEffectiveImageSize(paint)).toEqual({ height: 200, width: 400 });
  });

  it('should swap width and height for a 90° rotation', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 200, width: 400 });

    // result
    expect(getEffectiveImageSize({ ...paint, rotation: 90 })).toEqual({ height: 400, width: 200 });
  });

  it('should swap width and height for a 270° rotation', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 200, width: 400 });

    // result
    expect(getEffectiveImageSize({ ...paint, rotation: 270 })).toEqual({ height: 400, width: 200 });
  });

  it('should not swap dimensions for a 180° rotation', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 200, width: 400 });

    // result
    expect(getEffectiveImageSize({ ...paint, rotation: 180 })).toEqual({ height: 200, width: 400 });
  });
});
