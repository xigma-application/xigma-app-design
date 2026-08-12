import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState, TEndpointDragState } from '../../../types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from '../handlePointerDown';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const createDragStateRef = (): RefObject<TDragState | null> => ({ current: null });
const createEndpointDragRef = (): RefObject<TEndpointDragState | null> => ({ current: null });
const createMarqueeStartRef = (): RefObject<TPoint | null> => ({ current: null });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addTextNode = (x: number, y: number, size = 500): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(10, 10, { button: 1 }), store.dispatch, dragStateRef, createEndpointDragRef(), marqueeStartRef);

    // result
    expect(dragStateRef.current).toBeNull();
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should toggle the hit node into the selection on shift-click', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(105, 105, { shiftKey: true }),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      marqueeStartRef,
    );

    // result
    expect(store.getState().design.selectedIds).toEqual([idA]);
    expect(dragStateRef.current).toBeNull();
  });

  it('should delegate to armHitDrag when the pointer hits a node', () => {
    // mock
    const idA = addFrameNode(200, 200);
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(205, 205), store.dispatch, dragStateRef, createEndpointDragRef(), marqueeStartRef);

    // result
    expect(store.getState().design.selectedIds).toEqual([idA]);
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: null });
  });

  it('should delegate to armGroupBoundsDrag when clicking the gap inside a shared multi-selection', () => {
    // mock
    const idA = addFrameNode(300, 300, 20);
    const idB = addFrameNode(360, 300, 20);

    store.dispatch(setSelection([idA, idB]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(340, 310), store.dispatch, dragStateRef, createEndpointDragRef(), marqueeStartRef);

    // result
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: { kind: 'deselect' } });
  });

  it('should clear the selection and arm the marquee when clicking empty canvas', () => {
    // mock
    const idA = addFrameNode(400, 400);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(900, 900), store.dispatch, dragStateRef, createEndpointDragRef(), marqueeStartRef);

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(dragStateRef.current).toBeNull();
    expect(marqueeStartRef.current).not.toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should allow dragging from anywhere in a selected text node fixed box, even past its rendered content', () => {
    // mock
    const idA = addTextNode(1000, 1000);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before — click far from the actual "Hi" glyphs but still inside the 500x500 box
    handlePointerDown(canvas, pointerEvent(1300, 1300), store.dispatch, dragStateRef, createEndpointDragRef(), marqueeStartRef);

    // result
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: null });
    expect(marqueeStartRef.current).toBeNull();
  });

  it('should not select or drag an unselected text node when clicking inside its box but past its rendered content', () => {
    // mock
    const idA = addTextNode(1500, 1500);

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(1800, 1800), store.dispatch, dragStateRef, createEndpointDragRef(), marqueeStartRef);

    // result — falls through to marquee instead of grabbing the text
    expect(store.getState().design.selectedIds).not.toContain(idA);
    expect(dragStateRef.current).toBeNull();
    expect(marqueeStartRef.current).not.toBeNull();
  });

  it('should delegate to armEndpointDrag when a selected line endpoint is hit, instead of moving the whole shape', () => {
    // mock
    const idA = addLineNode(500, 500, 600, 500);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const endpointDragRef = createEndpointDragRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(500, 500), store.dispatch, dragStateRef, endpointDragRef, marqueeStartRef);

    // result
    expect(endpointDragRef.current).toEqual({ endpoint: 'a', nodeId: idA });
    expect(dragStateRef.current).toBeNull();
  });

  it('should fall back to a whole-shape move when the line is selected but the hit is not near an endpoint', () => {
    // mock
    const idA = addLineNode(700, 700, 800, 700);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const endpointDragRef = createEndpointDragRef();
    const marqueeStartRef = createMarqueeStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(750, 700), store.dispatch, dragStateRef, endpointDragRef, marqueeStartRef);

    // result
    expect(endpointDragRef.current).toBeNull();
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: null });
  });
});
