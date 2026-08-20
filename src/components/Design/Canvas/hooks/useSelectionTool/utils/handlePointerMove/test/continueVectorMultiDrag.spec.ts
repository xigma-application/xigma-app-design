import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

// utils
import { continueVectorMultiDrag } from '../continueVectorMultiDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorMultiDragRef = (vectorMultiDragState: TVectorMultiDragState | null = null): RefObject<TVectorMultiDragState | null> => ({
  current: vectorMultiDragState,
});

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorMultiDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no multi-drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();

    // before
    continueVectorMultiDrag(canvas, pointerEvent(10, 10), store.dispatch, createVectorMultiDragRef(), setClassName);

    // result
    expect(store.getState().design.nodes).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing when the drag points at a node that no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: {},
      hasMoved: false,
      nodeId: 'missing-node',
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
      vertexOrigins: { v1: { x: 0, y: 0 } },
    });
    const setClassName = vi.fn();

    // before
    continueVectorMultiDrag(canvas, pointerEvent(10, 10), store.dispatch, vectorMultiDragRef, setClassName);

    // result
    expect(store.getState().design.nodes).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should translate every selected vertex and every selected handle by the same delta, and switch the cursor to move', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const vectorMultiDragRef = createVectorMultiDragRef({
      handleOrigins: { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } },
      hasMoved: false,
      nodeId: idA,
      pendingClickAction: { id: 'v2', kind: 'vertex' },
      pointerStart: { x: 0, y: 0 },
      vertexOrigins: { v2: { x: 100, y: 0 } },
    });
    const setClassName = vi.fn();

    // before — cursor moved to (10, 4): delta (10, 4)
    continueVectorMultiDrag(canvas, pointerEvent(10, 4), store.dispatch, vectorMultiDragRef, setClassName);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({
      segments: { s1: { tangentEnd: { x: 5, y: 4 }, tangentStart: { x: 15, y: 4 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 110, y: 4 } },
    });
    expect(setClassName).toHaveBeenCalledWith('move');

    // result — a real move marks the drag as having moved, so a pending collapse won't fire on release
    expect(vectorMultiDragRef.current?.hasMoved).toBe(true);
  });
});
