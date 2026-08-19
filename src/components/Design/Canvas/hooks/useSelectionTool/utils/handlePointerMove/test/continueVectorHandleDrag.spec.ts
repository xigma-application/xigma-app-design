import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorHandleDragState } from 'types/design/selectionTool/types';

// utils
import { continueVectorHandleDrag } from '../continueVectorHandleDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorHandleDragRef = (
  vectorHandleDragState: TVectorHandleDragState | null = null,
): RefObject<TVectorHandleDragState | null> => ({ current: vectorHandleDragState });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
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

describe('continueVectorHandleDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no vector handle drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueVectorHandleDrag(canvas, pointerEvent(10, 10), store.dispatch, createVectorHandleDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should do nothing when the drag points at a node that no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const vectorHandleDragRef = createVectorHandleDragRef({ end: 'start', nodeId: 'missing-node', segmentId: 's1', vertexId: 'v1' });

    // before
    continueVectorHandleDrag(canvas, pointerEvent(10, 10), store.dispatch, vectorHandleDragRef);

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should set the tangentStart on the dragged segment relative to the vertex when dragging the "start" handle', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const vectorHandleDragRef = createVectorHandleDragRef({ end: 'start', nodeId: idA, segmentId: 's1', vertexId: 'v1' });

    // before
    continueVectorHandleDrag(canvas, pointerEvent(20, 5), store.dispatch, vectorHandleDragRef);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ segments: { s1: { tangentStart: { x: 20, y: 5 } } } });
  });

  it('should set the tangentEnd on the dragged segment relative to the vertex when dragging the "end" handle', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const vectorHandleDragRef = createVectorHandleDragRef({ end: 'end', nodeId: idA, segmentId: 's1', vertexId: 'v2' });

    // before
    continueVectorHandleDrag(canvas, pointerEvent(120, 15), store.dispatch, vectorHandleDragRef);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ segments: { s1: { tangentEnd: { x: 20, y: 15 } } } });
  });
});
