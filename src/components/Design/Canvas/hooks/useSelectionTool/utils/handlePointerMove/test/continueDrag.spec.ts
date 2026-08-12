import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from '../../../types';

// utils
import { continueDrag } from '../continueDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createDragStateRef = (dragState: TDragState | null = null): RefObject<TDragState | null> => ({ current: dragState });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueDrag(canvas, pointerEvent(10, 10), store.dispatch, createDragStateRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should move a box node by the pointer delta and mark the drag as moved', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 100, y: 100 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(10, 20), store.dispatch, dragStateRef);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ x: 110, y: 120 });
    expect(dragStateRef.current?.hasMoved).toBe(true);
  });

  it('should move a line node endpoints by the pointer delta', () => {
    // mock
    const idA = addLineNode(200, 200, 250, 200);
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x1: 200, x2: 250, y1: 200, y2: 200 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(5, 5), store.dispatch, dragStateRef);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ x1: 205, x2: 255, y1: 205, y2: 205 });
  });
});
