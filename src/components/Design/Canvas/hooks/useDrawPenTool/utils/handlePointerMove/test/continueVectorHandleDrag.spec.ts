import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { continueVectorHandleDrag } from '../continueVectorHandleDrag';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });
const createPenDraggedHandlePositionRef = (): TCanvasRefs['penDraggedHandlePositionRef'] => ({ current: null });
const createPenDraggedHandleIsSnappedRef = (): TCanvasRefs['penDraggedHandleIsSnappedRef'] => ({ current: false });
const createVectorAlignmentGuideRef = (): TCanvasRefs['vectorAlignmentGuideRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): TCanvasRefs['hoveredSegmentIdRef'] => ({ current: 's1' });

const addVectorNodeWithSegment = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
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
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should drag the outgoing tangent handle, clear the hovered segment, and switch to the plain pen cursor', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const setClassName = vi.fn();

    // before
    continueVectorHandleDrag(
      { x: 20, y: 5 },
      { nodeId, segmentId: 's1', vertexId: 'v1' },
      { x: 0, y: 0 },
      IDENTITY_VIEWPORT,
      false,
      store.dispatch,
      store,
      createPendingOutgoingTangentRef(),
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      createVectorAlignmentGuideRef(),
      hoveredSegmentIdRef,
      setClassName,
    );

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toEqual({ x: -20, y: -5 });
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('pen');
  });
});
