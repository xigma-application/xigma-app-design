// store
import { setImageEditor } from 'store/design/slice';
import { TImageEditorState } from 'store/design/types';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { armImageTileScaleOnPointerDown } from '../armImageTileScaleOnPointerDown';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

// a 20x20 source at 50% scale (paint.scale) is a 10x10 tile rect, anchored at the node's own (0,0)
const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scale: 0.5, scaleMode: 'tile', type: 'image' };

const createNode = (rotation = 0): TRectangleNode => ({
  fills: [paint],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
});

const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
const event = { pointerId: 1 } as PointerEvent;
const viewport = { x: 0, y: 0, zoom: 1 };
const imageEditor: TImageEditorState = { mode: 'tile', nodeId: 'rect-1', paintIndex: 0 };

describe('armImageTileScaleOnPointerDown', () => {
  beforeEach(() => {
    imagePaintTextureSizeCache.set('image-1', { height: 20, width: 20 });
  });

  afterEach(() => {
    imagePaintTextureSizeCache.clear();
  });

  it("should arm a tile-scale drag anchored to the tile rect's opposite corner when its own corner handle is grabbed", () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    // before — the (10,10) point is exactly the 10x10 tile rect's own 'se' corner handle
    const result = armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: 10, y: 10 },
      viewport,
      imageEditor,
      createNode(),
      paint,
    );

    // result — anchored to the tile rect's opposite ('nw') corner, at (0,0) — not the frame's own corner
    expect(result).toBe(true);
    expect(canvasRefs.imageCrop.imageTileScaleDragRef.current).toEqual({
      anchor: { x: 0, y: 0 },
      nodeId: 'rect-1',
      paintIndex: 0,
      startDistance: Math.hypot(10, 10),
      startScale: 0.5,
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should fall back to the default scale when the paint has none stored yet', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const unscaledPaint: TImagePaint = { ...paint, scale: undefined };

    // before — a 20x20 source at the default 50% scale is still a 10x10 tile
    armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: 10, y: 10 },
      viewport,
      imageEditor,
      createNode(),
      unscaledPaint,
    );

    // result
    expect(canvasRefs.imageCrop.imageTileScaleDragRef.current?.startScale).toBe(0.5);
  });

  it("should NOT arm when the point is on the frame's own (much larger) corner, letting the normal frame resize handle it instead", () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const node = createNode();

    // before — (100,100) is the frame's own 'se' corner, far outside the 10x10 tile rect
    const result = armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      node,
      { x: 100, y: 100 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result — falls through so armResizeOnPointerDown can resize the frame itself
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.imageCrop.imageTileScaleDragRef.current).toBeNull();
  });

  it("should also arm from an edge handle of the tile rect, anchored to the opposite edge's midpoint, since every handle scales the same single value", () => {
    // mock — an 80x80 tile (smaller than the 100x100 frame) so its own right edge (x=80) sits
    // well outside every corner's hit radius, and clear of the frame's own edges/corners entirely
    imagePaintTextureSizeCache.set('image-1', { height: 80, width: 80 });
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const node = createNode();
    const largePaint: TImagePaint = { ...paint, scale: 1 };

    // before — (80,40) is the tile rect's own 'e' edge handle
    const result = armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      node,
      { x: 80, y: 40 },
      viewport,
      imageEditor,
      node,
      largePaint,
    );

    // result — anchored to the opposite ('w') edge's own midpoint, at (0,40)
    expect(result).toBe(true);
    expect(canvasRefs.imageCrop.imageTileScaleDragRef.current).toEqual({
      anchor: { x: 0, y: 40 },
      nodeId: 'rect-1',
      paintIndex: 0,
      startDistance: 80,
      startScale: 1,
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should do nothing when the image size has not loaded yet (no tile rect to hit-test against)', () => {
    // mock
    imagePaintTextureSizeCache.clear();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const node = createNode();

    // before
    const result = armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      node,
      { x: 10, y: 10 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBeUndefined();
    expect(canvasRefs.imageCrop.imageTileScaleDragRef.current).toBeNull();
  });

  it('should not arm a scale drag when the node itself is rotated (v1 scope: unrotated frames only)', () => {
    // mock — (50,50) is the rotated node's own center, still "on" its body regardless of rotation
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const node = createNode(25);

    // before
    const result = armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      node,
      { x: 50, y: 50 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.imageCrop.imageTileScaleDragRef.current).toBeNull();
  });

  it("should let a click elsewhere on the editor's own node body proceed normally, without exiting the editor", () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const node = createNode();

    // before — (50,50) is the middle of the frame, well outside the 10x10 tile rect and not a frame handle
    const result = armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      node,
      { x: 50, y: 50 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("should NOT exit tile mode when the miss point is on the node's own rotate handle", () => {
    // mock — a point outside the (0,0)-(100,100) node's own nw corner, inside the rotate ring
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const node = createNode();

    // before
    const result = armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: -10, y: 0 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result — falls through so armRotateOnPointerDown can handle the actual rotation
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should exit tile mode and claim the event when the miss click hits nothing at all', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const node = createNode();

    // before
    const result = armImageTileScaleOnPointerDown(
      canvas,
      canvasRefs,
      dispatch,
      event,
      null,
      { x: 500, y: 500 },
      viewport,
      imageEditor,
      node,
      paint,
    );

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setImageEditor(null));
  });
});
