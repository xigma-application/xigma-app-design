import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState, TEndpointDragState, TPathOffsetDragState, TResizeDragState, TRotateDragState } from '../../../types';
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
const createPathOffsetDragRef = (): RefObject<TPathOffsetDragState | null> => ({ current: null });
const createResizeDragRef = (): RefObject<TResizeDragState | null> => ({ current: null });
const createRotateDragRef = (): RefObject<TRotateDragState | null> => ({ current: null });
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
      flipX: false,
      flipY: false,
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

const addPathTextNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
      pathFlip: false,
      pathId: 'ellipse-1',
      pathStartOffset: 0,
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

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, { button: 1 }),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

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
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(105, 105, { shiftKey: true }),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
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
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(205, 205),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

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
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(340, 310),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

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
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(900, 900),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

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
    const setClassName = vi.fn();

    // before — click far from the actual "Hi" glyphs but still inside the 500x500 box
    handlePointerDown(
      canvas,
      pointerEvent(1300, 1300),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

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
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(1800, 1800),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

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
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(500, 500),
      store.dispatch,
      dragStateRef,
      endpointDragRef,
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

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
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(750, 700),
      store.dispatch,
      dragStateRef,
      endpointDragRef,
      createPathOffsetDragRef(),
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

    // result
    expect(endpointDragRef.current).toBeNull();
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: null });
  });

  it('should delegate to armResizeDrag when a resize handle on a selected node is hit, instead of moving the node', () => {
    // mock
    const idA = addFrameNode(2000, 2000, 100);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const resizeDragRef = createResizeDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before — exactly on the "nw" corner handle
    handlePointerDown(
      canvas,
      pointerEvent(2000, 2000),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      resizeDragRef,
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

    // result
    expect(resizeDragRef.current).toMatchObject({ handle: 'nw' });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armRotateDrag when the ring just outside a resize handle is hit', () => {
    // mock — the "nw" corner sits at (2500, 2500)
    const idA = addFrameNode(2500, 2500, 100);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const rotateDragRef = createRotateDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before — 10 world units above the corner, inside the rotate ring but outside the resize radius
    handlePointerDown(
      canvas,
      pointerEvent(2500, 2490),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createPathOffsetDragRef(),
      createResizeDragRef(),
      rotateDragRef,
      marqueeStartRef,
      setClassName,
    );

    // result
    expect(rotateDragRef.current).not.toBeNull();
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it("should delegate to armPathOffsetDrag when a path-text node's offset handle is hit, instead of moving the whole node", () => {
    // mock — a 200x200 path-text box centered at (3100, 3100), handle at offset 0 sits at the rightmost edge
    const idA = addPathTextNode(3000, 3000, 200);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const pathOffsetDragRef = createPathOffsetDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(3200, 3100),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      pathOffsetDragRef,
      createResizeDragRef(),
      createRotateDragRef(),
      marqueeStartRef,
      setClassName,
    );

    // result
    expect(pathOffsetDragRef.current).toEqual({ nodeId: idA });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
    expect(setClassName).toHaveBeenCalledWith('pressing');
  });
});
