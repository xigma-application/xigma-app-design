// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getImageCropRect } from '../getImageCropRect';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const node: TRectangleNode = {
  fills: [],
  height: 200,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 15,
  type: NodeType.rectangle,
  width: 300,
  x: 10,
  y: 20,
};

const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('getImageCropRect behaviors', () => {
  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should return the stored crop rect when the paint already has one', () => {
    // before
    const crop = { height: 50, rotation: 30, width: 40, x: 1, y: 2 };

    // result
    expect(getImageCropRect(node, { ...paint, crop })).toBe(crop);
  });

  it('should fall back to the node bounds when the image size has not loaded yet', () => {
    // result — imagePaintTextureSizeCache has nothing for 'image-1'
    expect(getImageCropRect(node, paint)).toEqual({ height: 200, rotation: 15, width: 300, x: 10, y: 20 });
    expect(getImageCropRect(node, { ...paint, scaleMode: 'fit' })).toEqual({ height: 200, rotation: 15, width: 300, x: 10, y: 20 });
  });

  it('should fall back to the node bounds for stretch and tile, which never seed from the natural image size', () => {
    // mock — even with a known image size, stretch/tile keep their own frame-matching geometry
    imagePaintTextureSizeCache.set('image-1', { height: 100, width: 100 });

    // result
    expect(getImageCropRect(node, { ...paint, scaleMode: 'stretch' })).toEqual({ height: 200, rotation: 15, width: 300, x: 10, y: 20 });
    expect(getImageCropRect(node, { ...paint, scaleMode: 'tile' })).toEqual({ height: 200, rotation: 15, width: 300, x: 10, y: 20 });
  });

  it('should seed the letterboxed contain rect for fit, matching the natural image aspect ratio', () => {
    // mock — a 300x200 node (3:2) with a 100x100 (1:1) source image: fit letterboxes to a
    // 200x200 square, centered horizontally, never exceeding the node bounds
    imagePaintTextureSizeCache.set('image-1', { height: 100, width: 100 });

    // result
    expect(getImageCropRect(node, { ...paint, scaleMode: 'fit' })).toEqual({ height: 200, rotation: 15, width: 200, x: 60, y: 20 });
  });

  it('should seed the cover rect for fill, keeping the image in its own natural aspect ratio and extending past the node bounds', () => {
    // mock — same 300x200 (3:2) node with a 100x100 (1:1) source image: cover must grow to
    // 300x300 (matching the node's own aspect-limiting axis) and extend 50px above/below the
    // node instead of squishing the square image into the node's own 3:2 box
    imagePaintTextureSizeCache.set('image-1', { height: 100, width: 100 });

    // result
    expect(getImageCropRect(node, paint)).toEqual({ height: 300, rotation: 15, width: 300, x: 10, y: -30 });
  });

  it('should swap the effective image dimensions for a 90°/270° EXIF rotation', () => {
    // mock — a physically 100x50 (2:1) image rotated 90° behaves like a 50x100 (0.5:1) source
    imagePaintTextureSizeCache.set('image-1', { height: 50, width: 100 });

    // result — with the swapped 50x100 aspect against the 300x200 node, fit is height-bound
    const rotatedFitCrop = getImageCropRect(node, { ...paint, rotation: 90, scaleMode: 'fit' });

    expect(rotatedFitCrop.height).toBe(200);
    expect(rotatedFitCrop.width).toBeCloseTo(100, 5);
  });
});
