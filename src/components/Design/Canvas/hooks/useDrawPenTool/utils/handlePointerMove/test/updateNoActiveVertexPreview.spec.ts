// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { updateNoActiveVertexPreview } from '../updateNoActiveVertexPreview';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createPenPreviewRef = (): TPenRefs['penPreviewRef'] => ({
  current: { from: { x: 0, y: 0 }, isSnapped: false, tangentFromOffset: null, to: { x: 1, y: 1 } },
});
const createPenNewVertexPreviewRef = (): TPenRefs['penNewVertexPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): THoverRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPenHoveredDragArmableVertexRef = (): TPenRefs['penHoveredDragArmableVertexRef'] => ({ current: false });
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({
  current: { horizontal: null, vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } } },
});

describe('updateNoActiveVertexPreview', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the rubber-band pen preview and the alignment guide, and preview the next vertex at the pointer, when there is no target node', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const vectorAlignmentGuideRef = createVectorAlignmentGuideRef();
    const setClassName = vi.fn();

    // before
    updateNoActiveVertexPreview(
      { x: 10, y: 10 },
      null,
      IDENTITY_VIEWPORT,
      penNewVertexPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      penPreviewRef,
      vectorAlignmentGuideRef,
      setClassName,
    );

    // result
    expect(penPreviewRef.current).toBeNull();
    expect(vectorAlignmentGuideRef.current).toBeNull();
    expect(penNewVertexPreviewRef.current).toEqual({ x: 10, y: 10 });
    expect(setClassName).toHaveBeenCalledWith('pen');
  });

  it('should snap the next-vertex preview onto an existing vertex on the given node and switch to the pen-snap cursor', () => {
    // mock
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
    const node = store.getState().design.nodes[rootOrder[rootOrder.length - 1]] as TVectorNode;
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const setClassName = vi.fn();

    // before — hover a couple of px away from v1 (0,0)
    updateNoActiveVertexPreview(
      { x: 2, y: 1 },
      node,
      IDENTITY_VIEWPORT,
      penNewVertexPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createPenPreviewRef(),
      createVectorAlignmentGuideRef(),
      setClassName,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ id: 'v1', x: 0, y: 0 });
    expect(setClassName).toHaveBeenCalledWith('pen-snap');
  });
});
