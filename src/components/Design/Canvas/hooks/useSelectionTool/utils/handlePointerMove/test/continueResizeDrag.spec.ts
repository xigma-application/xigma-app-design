import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TResizeDragState } from '../../../types';

// utils
import { continueResizeDrag } from '../continueResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, ...options });

const createResizeDragRef = (resizeDragState: TResizeDragState | null = null): RefObject<TResizeDragState | null> => ({
  current: resizeDragState,
});

const addFrameNode = (x: number, y: number, width: number, height: number, parentId: string | null = null): string => {
  store.dispatch(addNode({ fill: '#ff0000', height, name: 'Frame', parentId, rotation: 0, type: NodeType.frame, width, x, y }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number, parentId: string | null = null): string => {
  store.dispatch(addNode({ name: 'Line', parentId, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueResizeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueResizeDrag(canvas, pointerEvent(10, 10), store.dispatch, createResizeDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should resize a single node from a corner handle', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: { [idA]: { height: 50, width: 100, x: 0, y: 0 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(150, 80), store.dispatch, resizeDragRef);

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 80, width: 150, x: 0, y: 0 });
  });

  it('should lock the aspect ratio on a corner handle while Shift is held', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: { [idA]: { height: 50, width: 100, x: 0, y: 0 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(150, 80, { shiftKey: true }), store.dispatch, resizeDragRef);

    // result — height-driven since raw width (150) is proportionally narrower than the 2:1 ratio needs
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 80, width: 160, x: 0, y: 0 });
  });

  it('should ignore Shift on an edge handle, since aspect-lock only applies to corners', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 2,
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      handle: 'e',
      nodeOrigins: { [idA]: { height: 50, width: 100, x: 0, y: 0 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(150, 999, { shiftKey: true }), store.dispatch, resizeDragRef);

    // result — vertical axis untouched, exactly as a plain (unlocked) east-edge resize
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 50, width: 150, x: 0, y: 0 });
  });

  it('should scale every selected node — including a line by its endpoints — proportionally to the shared bbox', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 100, 'parent-1');
    const idLine = addLineNode(20, 20, 80, 80, 'parent-1');
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      nodeOrigins: {
        [idA]: { height: 100, width: 100, x: 0, y: 0 },
        [idLine]: { x1: 20, x2: 80, y1: 20, y2: 80 },
      },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(200, 200), store.dispatch, resizeDragRef);

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 200, width: 200, x: 0, y: 0 });
    expect(store.getState().design.nodes[idLine]).toMatchObject({ x1: 40, x2: 160, y1: 40, y2: 160 });
  });

  it('should guard the scale factor instead of dividing by a zero-size origin bounds', () => {
    // mock
    const idA = addFrameNode(5, 5, 0, 0);
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 0, width: 0, x: 5, y: 5 },
      handle: 'se',
      nodeOrigins: { [idA]: { height: 0, width: 0, x: 5, y: 5 } },
    });

    // before
    continueResizeDrag(canvas, pointerEvent(50, 50), store.dispatch, resizeDragRef);

    // result — without the guard, scale would be Infinity (2 / 0) and 0 * Infinity would produce NaN
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 0, width: 0, x: 5, y: 5 });
  });
});
