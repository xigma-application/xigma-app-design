import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1 });

const createDragOriginRef = (value: TPenDragOrigin | null = null): RefObject<TPenDragOrigin | null> => ({ current: value });
const createDragStartRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });
const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });
const createPenPreviewRef = (): TCanvasRefs['penPreviewRef'] => ({ current: null });
const createPenHoverVertexRef = (): TCanvasRefs['penHoverVertexRef'] => ({ current: null });

const addVectorNodeWithSegment = (): string => {
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

describe('handlePointerMove', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should drag the outgoing tangent handle when a drag is already armed', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penHoverVertexRef = createPenHoverVertexRef();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(20, 5),
      store.dispatch,
      store,
      createDragOriginRef({ nodeId, segmentId: 's1', vertexId: 'v1' }),
      createDragStartRef({ x: 0, y: 0 }),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penHoverVertexRef,
    );

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toEqual({ x: -20, y: -5 });
  });

  it('should clear the pen preview and hover target when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penHoverVertexRef = createPenHoverVertexRef();

    penPreviewRef.current = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 1, y: 1 } };
    penHoverVertexRef.current = { nodeId: 'stale', point: { x: 0, y: 0 }, vertexId: 'stale-vertex' };

    // before
    handlePointerMove(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penHoverVertexRef,
    );

    // result
    expect(penPreviewRef.current).toBeNull();
    expect(penHoverVertexRef.current).toBeNull();
  });

  it('should update the pen preview toward the pointer when a node is being edited', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(setVectorEditingNodeId(nodeId));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penHoverVertexRef = createPenHoverVertexRef();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(500, 500),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penHoverVertexRef,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 500, y: 500 } });
  });
});
