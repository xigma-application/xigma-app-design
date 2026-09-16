import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
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

  it('should grow the rect from its opposite (nw) corner when dragging the se handle', () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ handle: 'se', nodeId, origin, paintIndex: 0 });

    // before
    continueImageCropResizeDrag(canvas, pointerEvent(60, 50), store.dispatch, dragRef);

    // result — the nw corner (0,0) stays fixed, the se corner follows the cursor
    expect(getCropRect(nodeId)).toEqual({ height: 50, rotation: 0, width: 60, x: 0, y: 0 });
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
