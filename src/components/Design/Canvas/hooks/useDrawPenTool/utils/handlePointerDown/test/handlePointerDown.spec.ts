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
import { handlePointerDown } from '../handlePointerDown';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });
const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });
const createVectorAlignmentGuideRef = (): TCanvasRefs['vectorAlignmentGuideRef'] => ({ current: null });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should ignore a non-primary button press entirely', () => {
    // mock
    const canvas = createCanvas();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, { button: 1 }),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(store.getState().design.vectorEditingNodeId).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should start a brand-new vector network when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 20),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      createVectorAlignmentGuideRef(),
    );

    // result
    const { vectorEditingNodeId } = store.getState().design;

    expect(vectorEditingNodeId).not.toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should start a new fragment on the edited node when it has no active vertex yet', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();

    // before — far from v1, so it adds a new vertex
    handlePointerDown(
      canvas,
      pointerEvent(500, 500),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      createVectorAlignmentGuideRef(),
    );

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(store.getState().design.penActiveVertexId).not.toBeNull();
  });

  it('should continue the network from the active vertex when one is already set', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(500, 500),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      createVectorAlignmentGuideRef(),
    );

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const [segment] = Object.values(node.segments);

    expect(segment).toMatchObject({ startId: 'v1' });
  });
});
