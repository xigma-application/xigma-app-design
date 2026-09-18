// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { computeImageCropZoomRect } from '../computeImageCropZoomRect';
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

describe('computeImageCropZoomRect', () => {
  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should return undefined when the image size has not loaded yet', () => {
    // result
    expect(computeImageCropZoomRect(node, paint, 50)).toBeUndefined();
  });

  it('should compute the Fit/contain rect at 0% for a freshly seeded crop, centered on the frame since that is where the seed itself starts — the paint keeps its own scaleMode (e.g. Fill) untouched, only this toolbar reasons in Fit terms', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // result
    expect(computeImageCropZoomRect(node, paint, 0)).toEqual({ height: 200, rotation: 0, width: 200, x: 0, y: 0 });
  });

  it('should compute the native size at 100%, still centered on the frame for a freshly seeded crop', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // result — 400x400 centered on the 200x200 frame extends 100px past each edge
    expect(computeImageCropZoomRect(node, paint, 100)).toEqual({ height: 400, rotation: 0, width: 400, x: -100, y: -100 });
  });

  it('should interpolate linearly at 50%, still centered on the frame for a freshly seeded crop', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // result — halfway between 200 and 400 is 300, centered
    expect(computeImageCropZoomRect(node, paint, 50)).toEqual({ height: 300, rotation: 0, width: 300, x: -50, y: -50 });
  });

  it('should keep the crop anchored on its own existing center while zooming, not snap it back to the frame center — e.g. after the user dragged it off-center on canvas', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // before — a 200x200 crop shifted 50px right/down from the frame's own center (which would be
    // x:0, y:0); its own center sits at (150, 150) instead of the frame's (100, 100)
    const offCenterCrop = { height: 200, rotation: 0, width: 200, x: 50, y: 50 };

    // result — 50% grows the crop to 300x300, but keeps it centered on (150, 150), the crop's own
    // prior center — not (100, 100), which is where a frame-centered anchor would have placed it
    expect(computeImageCropZoomRect(node, { ...paint, crop: offCenterCrop }, 50)).toEqual({
      height: 300,
      rotation: 0,
      width: 300,
      x: 0,
      y: 0,
    });
  });

  it('should clamp a percent above 100 down to the native size', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // result
    expect(computeImageCropZoomRect(node, paint, 250)).toEqual({ height: 400, rotation: 0, width: 400, x: -100, y: -100 });
  });

  it('should clamp a negative percent down to the Fit/contain size', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // result
    expect(computeImageCropZoomRect(node, paint, -50)).toEqual({ height: 200, rotation: 0, width: 200, x: 0, y: 0 });
  });

  it('should allow the native size to leave gaps when it is smaller than the Fit/contain size', () => {
    // mock — a 100x100 source image is smaller than the 200x200 contain size this node needs
    imagePaintTextureSizeCache.set('image-1', { height: 100, width: 100 });

    // result — 100% still resolves to the (smaller) native size, centered, leaving gaps
    expect(computeImageCropZoomRect(node, paint, 100)).toEqual({ height: 100, rotation: 0, width: 100, x: 50, y: 50 });
  });

  it("should fit a differently-proportioned node by locking one axis to it and leaving gaps on the other, never overflowing, while scaling each axis independently as it zooms — regardless of the paint's own Fill/Fit scaleMode", () => {
    // mock — a 200x100 (2:1) node with a 300x600 (1:2) native image: the image is relatively tall,
    // so fitting it inside the node locks height to the node's own 100 and leaves gaps on width,
    // shrinking it to 50 (100 / 2, the image's own width-to-height ratio) — never overflowing either
    // axis, even though this paint's own scaleMode is 'fill' (the toolbar always reasons in Fit terms)
    const wideNode: TRectangleNode = { ...node, height: 100, width: 200 };

    imagePaintTextureSizeCache.set('image-1', { height: 600, width: 300 });

    // result — 0%: the Fit/contain rect, height locked to the node, width gapped, centered on it
    const containRect = computeImageCropZoomRect(wideNode, paint, 0)!;

    expect(containRect).toEqual({ height: 100, rotation: 0, width: 50, x: 75, y: 0 });
    expect(containRect.width).toBeLessThanOrEqual(wideNode.width);
    expect(containRect.height).toBeLessThanOrEqual(wideNode.height);

    // result — 50%: each axis interpolates independently toward its own native size (width has a
    // 250px range to cover, height has a 500px range), while staying centered on the same node
    expect(computeImageCropZoomRect(wideNode, paint, 50)).toEqual({ height: 350, rotation: 0, width: 175, x: 12.5, y: -125 });

    // result — 100%: the untouched native size, still centered on the node, now well past its bounds
    expect(computeImageCropZoomRect(wideNode, paint, 100)).toEqual({ height: 600, rotation: 0, width: 300, x: -50, y: -250 });
  });

  it('should preserve the crop rotation already stored on the paint', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // before
    const existingCrop = { height: 250, rotation: 33, width: 250, x: -25, y: -25 };

    // result
    expect(computeImageCropZoomRect(node, { ...paint, crop: existingCrop }, 100)?.rotation).toBe(33);
  });
});
