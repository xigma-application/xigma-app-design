// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getImageCropZoomPercent } from '../getImageCropZoomPercent';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

// a 200x200 (1:1) node with a 100x100 (1:1) source image — the Fit/contain size equals the node
// bounds (200x200), so a 400x400 image would sit at 50% (halfway between 200 and 400)
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

describe('getImageCropZoomPercent', () => {
  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should return 0 when the image size has not loaded yet', () => {
    // result
    expect(getImageCropZoomPercent(node, paint)).toBe(0);
  });

  it('should return 0 for a freshly seeded crop, since it starts at the Fit/contain size', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // result — no paint.crop yet, so getImageCropRect seeds the 200x200 contain rect
    expect(getImageCropZoomPercent(node, paint)).toBe(0);
  });

  it('should return 100 when the crop already matches the native image size', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // before — crop already at the full 400x400 native size
    const crop = { height: 400, rotation: 0, width: 400, x: -100, y: -100 };

    // result
    expect(getImageCropZoomPercent(node, { ...paint, crop })).toBe(100);
  });

  it('should return 50 for a crop exactly halfway between the Fit/contain size and the native size', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // before — halfway between 200 (contain) and 400 (native) is 300
    const crop = { height: 300, rotation: 0, width: 300, x: -50, y: -50 };

    // result
    expect(getImageCropZoomPercent(node, { ...paint, crop })).toBe(50);
  });

  it('should clamp to 0 when the crop is smaller than the Fit/contain size (e.g. a stale/manual crop)', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // before
    const crop = { height: 150, rotation: 0, width: 150, x: 25, y: 25 };

    // result
    expect(getImageCropZoomPercent(node, { ...paint, crop })).toBe(0);
  });

  it('should clamp to 100 when the crop is larger than the native size', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    // before
    const crop = { height: 500, rotation: 0, width: 500, x: -150, y: -150 };

    // result
    expect(getImageCropZoomPercent(node, { ...paint, crop })).toBe(100);
  });

  it("should read the percent off the width axis alone when the node and image proportions differ, regardless of the paint's own Fill/Fit scaleMode", () => {
    // mock — a 200x100 (2:1) node with a 300x600 (1:2) native image: fitting it inside the node
    // locks height to the node's own 100 and gaps width down to 50, so the width axis alone
    // ranges 50-300 (native) — even though this paint's own scaleMode is 'fill'
    const wideNode: TRectangleNode = { ...node, height: 100, width: 200 };

    imagePaintTextureSizeCache.set('image-1', { height: 600, width: 300 });

    // before — width halfway between the 50 contain size and the 300 native size is 175
    const crop = { height: 350, rotation: 0, width: 175, x: 12.5, y: -125 };

    // result
    expect(getImageCropZoomPercent(wideNode, { ...paint, crop })).toBe(50);
  });

  it('should return 0 when the native image size already equals the Fit/contain size (no zoom range at all)', () => {
    // mock — a 200x200 source image on a 200x200 node: the contain size equals the native size
    imagePaintTextureSizeCache.set('image-1', { height: 200, width: 200 });

    // result
    expect(getImageCropZoomPercent(node, paint)).toBe(0);
  });
});
