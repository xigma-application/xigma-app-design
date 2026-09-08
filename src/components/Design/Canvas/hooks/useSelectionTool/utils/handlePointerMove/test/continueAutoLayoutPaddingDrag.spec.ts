import { RefObject } from 'react';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';

// utils
import { continueAutoLayoutPaddingDrag } from '../continueAutoLayoutPaddingDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, shiftKey = false): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, shiftKey });

const addFrame = (overrides: { paddingLeft?: number; rotation?: number } = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: 200,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: overrides.rotation ?? 0,
      type: NodeType.frame,
      width: 300,
      x: 0,
      y: 0,
      ...(overrides.paddingLeft !== undefined ? { paddingLeft: overrides.paddingLeft } : {}),
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueAutoLayoutPaddingDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no padding drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: null };

    // before
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(10, 10), store.dispatch, paddingDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes).toEqual({});
  });

  it('should set the left padding to the pointer’s distance from the edge in absolute mode', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId,
      hasMoved: false,
      mode: 'absolute',
      originalPaddingValue: 0,
      point: { x: 0, y: 100 },
      pointerStart: { x: 0, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(40, 100), store.dispatch, paddingDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingLeft: 40 });
    expect(dragState.point).toEqual({ x: 40, y: 100 });
    expect(dragState.hasMoved).toBe(true);
  });

  it('should grow the left padding by the pointer delta in delta mode', () => {
    // mock
    const frameId = addFrame({ paddingLeft: 10 });
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId,
      hasMoved: false,
      mode: 'delta',
      originalPaddingValue: 10,
      point: { x: 10, y: 100 },
      pointerStart: { x: 10, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before — pointer moved 15 to the right
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(25, 100), store.dispatch, paddingDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingLeft: 25 });
  });

  it('should clamp the padding at 0 instead of going negative', () => {
    // mock
    const frameId = addFrame({ paddingLeft: 10 });
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId,
      hasMoved: false,
      mode: 'delta',
      originalPaddingValue: 10,
      point: { x: 10, y: 100 },
      pointerStart: { x: 10, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before — pointer dragged far to the left, past a negative padding
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(-100, 100), store.dispatch, paddingDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingLeft: 0 });
  });

  it('should round the padding value to the nearest integer', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId,
      hasMoved: false,
      mode: 'absolute',
      originalPaddingValue: 0,
      point: { x: 0, y: 100 },
      pointerStart: { x: 0, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(40.6, 100), store.dispatch, paddingDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingLeft: 41 });
  });

  it('should snap the padding value to the nearest multiple of 10 while Shift is held', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId,
      hasMoved: false,
      mode: 'absolute',
      originalPaddingValue: 0,
      point: { x: 0, y: 100 },
      pointerStart: { x: 0, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(44, 100, true), store.dispatch, paddingDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingLeft: 40 });
  });

  it('should grow the top padding by the downward pointer delta in delta mode', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId,
      hasMoved: false,
      mode: 'delta',
      originalPaddingValue: 10,
      point: { x: 150, y: 10 },
      pointerStart: { x: 150, y: 10 },
      side: 'top',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before — pointer moved 15 down
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(150, 25), store.dispatch, paddingDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingTop: 25 });
  });

  it('should un-rotate the pointer before applying it, for a rotated frame', () => {
    // mock — a 300x200 frame rotated 90deg (centre 150,100); grabbing exactly at the centre and
    // moving straight down 20 in world space reads as +20 along the frame's own local x axis
    const frameId = addFrame({ paddingLeft: 10, rotation: 90 });
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId,
      hasMoved: false,
      mode: 'delta',
      originalPaddingValue: 10,
      point: { x: 150, y: 100 },
      pointerStart: { x: 150, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(150, 120), store.dispatch, paddingDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingLeft: 30 });
  });

  it('should do nothing when the referenced frame no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const dragState: TAutoLayoutPaddingDragState = {
      frameId: 'missing',
      hasMoved: false,
      mode: 'absolute',
      originalPaddingValue: 0,
      point: { x: 0, y: 100 },
      pointerStart: { x: 0, y: 100 },
      side: 'left',
    };
    const paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null> = { current: dragState };

    // before
    continueAutoLayoutPaddingDrag(canvas, pointerEvent(40, 100), store.dispatch, paddingDragRef);

    // result — the drag state's tracked point is left untouched since nothing was resolved
    expect(dragState.point).toEqual({ x: 0, y: 100 });
  });
});
