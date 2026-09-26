// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { isAspectRatioPresetActive } from '../isAspectRatioPresetActive';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('isAspectRatioPresetActive', () => {
  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it('should return true when the node already exactly matches the preset rect', () => {
    // before — a square node with a 200x100 crop: a 1:1 preset fits to a 100x100 rect centered at
    // (100, 100), so a node already at exactly that rect should read as active
    const node: TRectangleNode = {
      fills: [],
      height: 100,
      id: 'rect-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 50,
      y: 50,
    };
    const crop = { height: 100, rotation: 0, width: 200, x: 0, y: 50 };

    // result
    expect(isAspectRatioPresetActive(node, { ...paint, crop }, { ratioHeight: 1, ratioWidth: 1 })).toBe(true);
  });

  it('should return false when the node does not match the preset rect', () => {
    // before
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

    // result — the node is still its own full 200x200 bounds, not the 1:1-fit-to-crop rect
    expect(isAspectRatioPresetActive(node, paint, { ratioHeight: 1, ratioWidth: 2 })).toBe(false);
  });

  it('should return false for "original" when the image size has not loaded yet', () => {
    // before
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

    // result
    expect(isAspectRatioPresetActive(node, paint, 'original')).toBe(false);
  });

  it('should tolerate a sub-pixel rounding difference but not a genuine mismatch', () => {
    // before — same 1:1-fit-to-crop scenario as the first test, node off by a tiny fraction
    const crop = { height: 100, rotation: 0, width: 200, x: 0, y: 50 };
    const closeNode: TRectangleNode = {
      fills: [],
      height: 100.2,
      id: 'rect-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 50,
      y: 50,
    };
    const farNode: TRectangleNode = { ...closeNode, height: 102 };

    // result
    expect(isAspectRatioPresetActive(closeNode, { ...paint, crop }, { ratioHeight: 1, ratioWidth: 1 })).toBe(true);
    expect(isAspectRatioPresetActive(farNode, { ...paint, crop }, { ratioHeight: 1, ratioWidth: 1 })).toBe(false);
  });

  it('should require the corner radius to also be maxed out for a "circle" target, even when the shape already matches the 1:1 rect', () => {
    // before — same 1:1-fit-to-crop scenario as the first test (a 100x100 rect at (50, 50))
    const crop = { height: 100, rotation: 0, width: 200, x: 0, y: 50 };
    const squareNode: TRectangleNode = {
      cornerRadius: 0,
      fills: [],
      height: 100,
      id: 'rect-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 50,
      y: 50,
    };
    const circleNode: TRectangleNode = { ...squareNode, cornerRadius: 50 };

    // result — matches the 1:1 shape, but the corner radius is still 0, not the max (50) a circle needs
    expect(isAspectRatioPresetActive(squareNode, { ...paint, crop }, { cornerRadius: 'max', ratioHeight: 1, ratioWidth: 1 })).toBe(false);

    // result — the plain Square target never cares about corner radius
    expect(isAspectRatioPresetActive(squareNode, { ...paint, crop }, { ratioHeight: 1, ratioWidth: 1 })).toBe(true);

    // result — once the corner radius is also maxed out, the circle target reads as active
    expect(isAspectRatioPresetActive(circleNode, { ...paint, crop }, { cornerRadius: 'max', ratioHeight: 1, ratioWidth: 1 })).toBe(true);
  });

  it('should read a shape without a stored corner radius as 0 for a "circle" target', () => {
    // mock
    const crop = { height: 100, rotation: 0, width: 200, x: 0, y: 50 };
    const node = {
      fills: [],
      height: 100,
      id: 'ellipse-1',
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 100,
      x: 50,
      y: 50,
    } as unknown as TRectangleNode;

    // result
    expect(isAspectRatioPresetActive(node, { ...paint, crop }, { cornerRadius: 'max', ratioHeight: 1, ratioWidth: 1 })).toBe(false);
  });
});
