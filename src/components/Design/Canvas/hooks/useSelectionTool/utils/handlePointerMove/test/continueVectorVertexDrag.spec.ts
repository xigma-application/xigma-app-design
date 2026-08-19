import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

// utils
import { continueVectorVertexDrag } from '../continueVectorVertexDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorVertexDragRef = (
  vectorVertexDragState: TVectorVertexDragState | null = null,
): RefObject<TVectorVertexDragState | null> => ({ current: vectorVertexDragState });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
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

describe('continueVectorVertexDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no vector vertex drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueVectorVertexDrag(canvas, pointerEvent(10, 10), store.dispatch, createVectorVertexDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should do nothing when the drag points at a node that no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const vectorVertexDragRef = createVectorVertexDragRef({
      nodeId: 'missing-node',
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueVectorVertexDrag(canvas, pointerEvent(10, 10), store.dispatch, vectorVertexDragRef);

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should translate only the dragged vertices, leaving the rest untouched', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const vectorVertexDragRef = createVectorVertexDragRef({
      nodeId: idA,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueVectorVertexDrag(canvas, pointerEvent(15, 7), store.dispatch, vectorVertexDragRef);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({
      vertices: { v1: { id: 'v1', x: 15, y: 7 }, v2: { id: 'v2', x: 100, y: 0 } },
    });
  });
});
