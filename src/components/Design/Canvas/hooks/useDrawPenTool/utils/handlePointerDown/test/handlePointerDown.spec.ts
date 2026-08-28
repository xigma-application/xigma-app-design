import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorEditRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
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
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({ current: null });

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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
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
      createCanvasRefs(),
    );

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should capture the currently selected vector vertices as the gesture-start snapshot', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['stale-vertex'] } } });

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
      refs,
    );

    // action
    const restored = store.dispatch(undo());

    // result
    expect(restored).toEqual({ selectedVectorHandles: [], selectedVectorSegmentIds: [], selectedVectorVertexIds: ['stale-vertex'] });
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
      createCanvasRefs(),
    );

    // result
    const { vectorEditingNodeIds } = store.getState().design;

    expect(vectorEditingNodeIds).not.toEqual([]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should start a new fragment on the edited node when it has no active vertex yet', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

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
      createCanvasRefs(),
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(store.getState().design.penActiveVertexId).not.toBeNull();
  });

  it('should continue the network from the active vertex when one is already set', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
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
      createCanvasRefs(),
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const [segment] = Object.values(node.segments);

    expect(segment).toMatchObject({ startId: 'v1' });
  });
});
