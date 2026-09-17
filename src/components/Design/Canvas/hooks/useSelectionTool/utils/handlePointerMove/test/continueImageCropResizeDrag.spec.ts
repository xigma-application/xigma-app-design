import { RefObject } from 'react';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageCropResizeDragState } from 'types/design/canvas/types';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueImageCropResizeDrag } from '../continueImageCropResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createRef = (dragState: TImageCropResizeDragState | null = null): RefObject<TImageCropResizeDragState | null> => ({
  current: dragState,
});

const addImageRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const getCropRect = (nodeId: string): TImagePaint['crop'] => {
  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;
  const paint = node.fills[0] as TImagePaint;

  return paint.crop;
};

const getPaint = (nodeId: string): TImagePaint => {
  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;

  return node.fills[0] as TImagePaint;
};

describe('continueImageCropResizeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueImageCropResizeDrag(canvas, pointerEvent(30, 50), store.dispatch, createRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it("should grow the rect from its opposite (nw) corner when dragging the se handle, keeping the crop's own aspect ratio locked", () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'se', nodeId, origin, paintIndex: 0 });

    // before — the pointer moves to (60, 50), an uneven delta, but the 1:1 origin ratio wins
    continueImageCropResizeDrag(canvas, pointerEvent(60, 50), store.dispatch, dragRef);

    // result — the nw corner (0,0) stays fixed, both axes grow together to stay square
    expect(getCropRect(nodeId)).toEqual({ height: 60, rotation: 0, width: 60, x: 0, y: 0 });
  });

  it('should shrink the rect from its opposite (se) corner when dragging the nw handle', () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'nw', nodeId, origin, paintIndex: 0 });

    // before
    continueImageCropResizeDrag(canvas, pointerEvent(10, 10), store.dispatch, dragRef);

    // result — the se corner (40,40) stays fixed
    expect(getCropRect(nodeId)).toEqual({ height: 30, rotation: 0, width: 30, x: 10, y: 10 });
  });

  it("should keep a non-square crop's own aspect ratio locked automatically, with no shift key or lock flag involved", () => {
    // mock — a 2:1 crop, growing towards a point that would otherwise skew it
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 80, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'se', nodeId, origin, paintIndex: 0 });

    // before — the pointer's own raw delta (100, 60) is nowhere near 2:1
    continueImageCropResizeDrag(canvas, pointerEvent(100, 60), store.dispatch, dragRef);

    // result — the resulting box still has the original 2:1 ratio
    const crop = getCropRect(nodeId);

    expect(crop).toEqual({ height: 60, rotation: 0, width: 120, x: 0, y: 0 });
    expect(crop!.width / crop!.height).toBe(origin.width / origin.height);
  });

  it('should preserve the rotation on the resized crop rect', () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 30, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'se', nodeId, origin, paintIndex: 0 });

    // before
    continueImageCropResizeDrag(canvas, pointerEvent(60, 50), store.dispatch, dragRef);

    // result
    expect(getCropRect(nodeId)?.rotation).toBe(30);
  });

  it('should not throw when the dragged node no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'se', nodeId: 'gone', origin, paintIndex: 0 });

    // before / result
    expect(() => continueImageCropResizeDrag(canvas, pointerEvent(60, 50), store.dispatch, dragRef)).not.toThrow();
  });

  it('should mirror the image when the se handle is dragged past the opposite (nw) anchor on both axes, and un-mirror it when dragged back (regression: crop-mode resize had no flip handling at all)', () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'se', nodeId, origin, paintIndex: 0 });

    // before — drag the se handle past the nw anchor on both axes
    continueImageCropResizeDrag(canvas, pointerEvent(-10, -10), store.dispatch, dragRef);

    // result — mirrored on both axes
    expect(getPaint(nodeId)).toMatchObject({ flipX: true, flipY: true });

    // before — drag it back past the anchor again
    continueImageCropResizeDrag(canvas, pointerEvent(60, 50), store.dispatch, dragRef);

    // result — un-mirrored again
    expect(getPaint(nodeId).flipX).toBeFalsy();
    expect(getPaint(nodeId).flipY).toBeFalsy();
  });

  it('should preserve an existing flip while resizing without crossing the anchor', () => {
    // mock
    const nodeId = addImageRectangle();
    store.dispatch(updateNode({ changes: { fills: [{ ...getPaint(nodeId), flipX: true }] }, id: nodeId }));
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'se', nodeId, origin, originalFlipX: true, paintIndex: 0 });

    // before — grow without crossing the anchor
    continueImageCropResizeDrag(canvas, pointerEvent(60, 50), store.dispatch, dragRef);

    // result — still flipped
    expect(getPaint(nodeId).flipX).toBe(true);
  });

  it('should do nothing when the targeted paint is no longer an image', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 100,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'se', nodeId, origin, paintIndex: 0 });

    // before / result
    expect(() => continueImageCropResizeDrag(canvas, pointerEvent(60, 50), store.dispatch, dragRef)).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });
});
