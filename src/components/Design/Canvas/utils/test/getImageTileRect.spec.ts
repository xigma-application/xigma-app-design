// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getImageTileRect } from '../getImageTileRect';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const node: TRectangleNode = {
  fills: [],
  height: 200,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 300,
  x: 10,
  y: 20,
};

const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scale: 0.5, scaleMode: 'tile', type: 'image' };

describe('getImageTileRect behaviors', () => {
  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should return undefined when the image size has not loaded yet', () => {
    expect(getImageTileRect(node, paint)).toBeUndefined();
  });

  it('should size the rect to the natural image size scaled by the paint scale, anchored to the node origin', () => {
    // mock — a 100x80 source at 50% scale is a 50x40 tile
    imagePaintTextureSizeCache.set('image-1', { height: 80, width: 100 });

    expect(getImageTileRect(node, paint)).toEqual({ height: 40, rotation: 0, width: 50, x: 10, y: 20 });
  });

  it('should fall back to the default 50% scale when the paint has none stored yet', () => {
    imagePaintTextureSizeCache.set('image-1', { height: 80, width: 100 });

    expect(getImageTileRect(node, { ...paint, scale: undefined })).toEqual({ height: 40, rotation: 0, width: 50, x: 10, y: 20 });
  });

  it('should swap the effective image dimensions for a 90°/270° EXIF rotation', () => {
    // mock — a physically 100x50 (2:1) image rotated 90° behaves like a 50x100 source
    imagePaintTextureSizeCache.set('image-1', { height: 50, width: 100 });

    expect(getImageTileRect(node, { ...paint, rotation: 90, scale: 1 })).toEqual({ height: 100, rotation: 0, width: 50, x: 10, y: 20 });
  });
});
