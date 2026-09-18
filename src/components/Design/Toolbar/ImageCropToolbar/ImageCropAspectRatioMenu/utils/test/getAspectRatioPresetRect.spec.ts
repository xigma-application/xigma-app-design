// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getAspectRatioPresetRect } from '../getAspectRatioPresetRect';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const node: TRectangleNode = {
  fills: [],
  height: 200,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 200,
  x: 0,
  y: 0,
};

const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('getAspectRatioPresetRect', () => {
  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should return undefined for "original" when the image size has not loaded yet', () => {
    // result
    expect(getAspectRatioPresetRect(node, paint, 'original')).toBeUndefined();
  });

  it('should size "original" to the native pixel dimensions, centered on the current crop\'s own center', () => {
    // mock — a 300x200 (3:2) native image
    imagePaintTextureSizeCache.set('image-1', { height: 200, width: 300 });

    // before — a 100x100 crop centered within the node, at (100, 100)
    const crop = { height: 100, rotation: 0, width: 100, x: 50, y: 50 };

    // result — 300x200 centered on (100, 100)
    expect(getAspectRatioPresetRect(node, { ...paint, crop }, 'original')).toEqual({ height: 200, width: 300, x: -50, y: 0 });
  });

  it('should fit a ratio target inside the current crop rect, not the node bounds', () => {
    // before — a 200x100 crop, offset from the node's own bounds
    const crop = { height: 100, rotation: 0, width: 200, x: 0, y: 50 };

    // result — a 1:1 square fit inside the 200x100 crop locks height, gaps width, centered on it
    expect(getAspectRatioPresetRect(node, { ...paint, crop }, { ratioHeight: 1, ratioWidth: 1 })).toEqual({
      height: 100,
      width: 100,
      x: 50,
      y: 50,
    });
  });

  it('should fall back to the node bounds as the crop rect when the paint has no crop and no image size yet', () => {
    // result — no crop, no loaded texture: getImageCropRect falls back to the node's own bounds
    expect(getAspectRatioPresetRect(node, paint, { ratioHeight: 1, ratioWidth: 2 })).toEqual({ height: 100, width: 200, x: 0, y: 50 });
  });
});
