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
import { updateActiveVertexPreview } from '../updateActiveVertexPreview';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });
const createPenPreviewRef = (): TCanvasRefs['penPreviewRef'] => ({ current: null });
const createPenNewVertexPreviewRef = (): TCanvasRefs['penNewVertexPreviewRef'] => ({ current: { x: 999, y: 999 } });
const createHoveredSegmentIdRef = (): TCanvasRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPenHoveredDragArmableVertexRef = (): TCanvasRefs['penHoveredDragArmableVertexRef'] => ({ current: false });
const createVectorAlignmentGuideRef = (): TCanvasRefs['vectorAlignmentGuideRef'] => ({ current: null });

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

describe('updateActiveVertexPreview', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should update the rubber-band pen preview, clear the idle new-vertex preview, and set the matching cursor className', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const setClassName = vi.fn();

    // before — hover well away from any existing vertex/edge
    updateActiveVertexPreview(
      { x: 500, y: 500 },
      node,
      store.getState().design.nodes,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
      [],
      penNewVertexPreviewRef,
      setClassName,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 500, y: 500 } });
    expect(penNewVertexPreviewRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('pen');
  });

  it('should switch to the pen-snap cursor when the rubber-band preview snaps onto an existing vertex', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const penPreviewRef = createPenPreviewRef();
    const setClassName = vi.fn();

    // before — hover right on v2 (100,0)
    updateActiveVertexPreview(
      { x: 100, y: 0 },
      node,
      store.getState().design.nodes,
      'v1',
      IDENTITY_VIEWPORT,
      false,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
      [],
      createPenNewVertexPreviewRef(),
      setClassName,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'v2', x: 100, y: 0 } });
    expect(setClassName).toHaveBeenCalledWith('pen-snap');
  });
});
