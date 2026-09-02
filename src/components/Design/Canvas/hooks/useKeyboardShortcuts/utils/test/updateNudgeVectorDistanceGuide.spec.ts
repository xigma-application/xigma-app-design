// store
import { addNode, deleteNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getPointToPointGuides } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getPointToPointGuides';
import { updateNudgeVectorDistanceGuide } from '../updateNudgeVectorDistanceGuide';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('updateNudgeVectorDistanceGuide', () => {
  let vectorNodeId: string;

  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    vectorNodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([vectorNodeId]));
    store.dispatch(setActiveTool(ToolName.move));
  });

  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should populate the ref against the hovered vertex when Alt is held and a vertex is selected', () => {
    // mock
    const refs = createCanvasRefs({
      hover: { hoveredVectorVertexIdRef: { current: 'v3' } },
      vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } },
    });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, true);

    // result — v1 (0,0) anchor vs. hovered v3 (100,100)
    expect(refs.transform.distanceGuidesRef.current).toEqual({
      ...getPointToPointGuides({ x: 0, y: 0 }, { x: 100, y: 100 }),
      targetPoint: { id: 'v3', x: 100, y: 100 },
    });
  });

  it('should leave the ref untouched when Alt is not held', () => {
    // mock
    const refs = createCanvasRefs({
      hover: { hoveredVectorVertexIdRef: { current: 'v3' } },
      vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } },
    });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, false);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should leave the ref untouched when not in Vector Edit Mode', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds([]));

    const refs = createCanvasRefs({
      hover: { hoveredVectorVertexIdRef: { current: 'v3' } },
      vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } },
    });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, true);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should leave the ref untouched for a Vector Edit sub-tool other than Move', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.bend));

    const refs = createCanvasRefs({
      hover: { hoveredVectorVertexIdRef: { current: 'v3' } },
      vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } },
    });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, true);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should leave the ref untouched when nothing is selected', () => {
    // mock
    const refs = createCanvasRefs({ hover: { hoveredVectorVertexIdRef: { current: 'v3' } } });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, true);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should leave the ref untouched when no vertex is hovered', () => {
    // mock
    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, true);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should leave the ref untouched when the only hovered vertex is itself part of the selection', () => {
    // mock
    const refs = createCanvasRefs({
      hover: { hoveredVectorVertexIdRef: { current: 'v1' } },
      vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } },
    });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, true);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should treat unset selection refs as empty and leave the ref untouched', () => {
    // mock
    const refs = createCanvasRefs({
      hover: { hoveredVectorVertexIdRef: { current: 'v3' } },
      vectorEdit: {
        selectedVectorSegmentIdsRef: { current: null as unknown as string[] },
        selectedVectorVertexIdsRef: { current: null as unknown as string[] },
      },
    });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, true);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should not fall back to a hovered segment or face — a keyboard nudge has no live cursor point to project against', () => {
    // mock — hovering s2 (which v1 is not part of) instead of a vertex
    const refs = createCanvasRefs({
      hover: { hoveredVectorSegmentIdRef: { current: 's2' } },
      vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } },
    });

    // action
    updateNudgeVectorDistanceGuide(store.getState(), refs, true);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });
});
