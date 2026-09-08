import { RefObject } from 'react';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutGapDragState } from 'types/design/canvas/types';

// utils
import { continueAutoLayoutGapDrag } from '../continueAutoLayoutGapDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addFrame = (rotation = 0): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: 200,
      horizontalGap: 30,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation,
      type: NodeType.frame,
      verticalGap: 10,
      width: 300,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueAutoLayoutGapDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no gap drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: null };

    // before
    continueAutoLayoutGapDrag(canvas, pointerEvent(10, 10), store.dispatch, gapDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes).toEqual({});
  });

  it('should grow the horizontal gap by the pointer delta and update the tracked point', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TAutoLayoutGapDragState = {
      axis: 'horizontal',
      frameId,
      originalGapValue: 30,
      point: { x: 50, y: 0 },
      pointerStart: { x: 50, y: 0 },
    };
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: dragState };

    // before — pointer moved 20 to the right
    continueAutoLayoutGapDrag(canvas, pointerEvent(70, 0), store.dispatch, gapDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ horizontalGap: 50 });
    expect(dragState.point).toEqual({ x: 70, y: 0 });
  });

  it('should grow the vertical gap by the pointer delta on the y axis', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TAutoLayoutGapDragState = {
      axis: 'vertical',
      frameId,
      originalGapValue: 10,
      point: { x: 0, y: 50 },
      pointerStart: { x: 0, y: 50 },
    };
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: dragState };

    // before — pointer moved 30 down
    continueAutoLayoutGapDrag(canvas, pointerEvent(0, 80), store.dispatch, gapDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ verticalGap: 40 });
  });

  it('should allow the gap to go negative, with no lower clamp', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TAutoLayoutGapDragState = {
      axis: 'horizontal',
      frameId,
      originalGapValue: 30,
      point: { x: 50, y: 0 },
      pointerStart: { x: 50, y: 0 },
    };
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: dragState };

    // before — pointer dragged far to the left, past a negative gap
    continueAutoLayoutGapDrag(canvas, pointerEvent(-100, 0), store.dispatch, gapDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ horizontalGap: -120 });
  });

  it('should un-rotate the pointer delta before applying it, for a rotated frame', () => {
    // mock — a 300x200 frame rotated 90deg (centre 150,100); grabbing exactly at the centre and
    // moving straight down 20 in world space reads as +20 along the frame's own local x axis
    const frameId = addFrame(90);
    const canvas = createCanvas();
    const dragState: TAutoLayoutGapDragState = {
      axis: 'horizontal',
      frameId,
      originalGapValue: 30,
      point: { x: 150, y: 100 },
      pointerStart: { x: 150, y: 100 },
    };
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: dragState };

    // before
    continueAutoLayoutGapDrag(canvas, pointerEvent(150, 120), store.dispatch, gapDragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ horizontalGap: 50 });
  });

  it('should do nothing when the referenced frame no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const dragState: TAutoLayoutGapDragState = {
      axis: 'horizontal',
      frameId: 'missing',
      originalGapValue: 30,
      point: { x: 50, y: 0 },
      pointerStart: { x: 50, y: 0 },
    };
    const gapDragRef: RefObject<TAutoLayoutGapDragState | null> = { current: dragState };

    // before
    continueAutoLayoutGapDrag(canvas, pointerEvent(70, 0), store.dispatch, gapDragRef);

    // result — the drag state's tracked point is left untouched since nothing was resolved
    expect(dragState.point).toEqual({ x: 50, y: 0 });
  });
});
