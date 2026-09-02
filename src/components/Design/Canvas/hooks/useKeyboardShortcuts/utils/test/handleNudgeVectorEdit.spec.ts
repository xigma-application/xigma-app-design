// store
import { addNode, deleteNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleNudgeVectorEdit } from '../handleNudgeVectorEdit';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: 10, y: 0 }, tangentStart: { x: -10, y: 0 } },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: { v2: 'symmetric' },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addSecondVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s3: { endId: 'v5', id: 's3', startId: 'v4', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v4: { id: 'v4', x: 0, y: 0 }, v5: { id: 'v5', x: 10, y: 10 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const getVectorNode = (id: string): TVectorNode =>
  store.getState().design.pages[store.getState().design.activePageId].nodes[id] as TVectorNode;

describe('handleNudgeVectorEdit', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.move));
  });

  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should shift every selected vertex by the given delta', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } });

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 5, -3, false);

    // result
    expect(getVectorNode(vectorId).vertices.v1).toEqual({ id: 'v1', x: 5, y: -3 });
    expect(getVectorNode(vectorId).vertices.v2).toEqual({ id: 'v2', x: 100, y: 0 });
  });

  it('should shift selected vertices spanning two different open nodes, one updateNode dispatch per node', () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addSecondVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorIdA, vectorIdB]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1', 'v4'] } } });

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 1, 1, false);

    // result
    expect(getVectorNode(vectorIdA).vertices.v1).toEqual({ id: 'v1', x: 1, y: 1 });
    expect(getVectorNode(vectorIdB).vertices.v4).toEqual({ id: 'v4', x: 1, y: 1 });
  });

  it('should be undoable as a single step even across two nodes', () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addSecondVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorIdA, vectorIdB]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1', 'v4'] } } });

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 1, 1, false);
    store.dispatch(undo());

    // result
    expect(getVectorNode(vectorIdA).vertices.v1).toEqual({ id: 'v1', x: 0, y: 0 });
    expect(getVectorNode(vectorIdB).vertices.v4).toEqual({ id: 'v4', x: 0, y: 0 });
  });

  it('should shift a selected tangent handle by the given delta', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorHandlesRef: { current: [{ end: 'end', segmentId: 's1' }] } } });

    // action — v1's segment s1 has tangentEnd (10,0); nudging right by 4 should move it to (14,0)
    handleNudgeVectorEdit(store.dispatch, refs, 4, 0, false);

    // result
    expect(getVectorNode(vectorId).segments.s1.tangentEnd).toEqual({ x: 14, y: 0 });
  });

  it('should not mirror any other handle when the vertex handle mode defaults to corner', () => {
    // mock — v1 has no entry in vertexHandleModes, so it defaults to 'corner' (no mirroring)
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's1' }] } } });

    // action — s1's tangentStart goes from (-10,0) to (-6,0)
    handleNudgeVectorEdit(store.dispatch, refs, 4, 0, false);

    // result
    expect(getVectorNode(vectorId).segments.s1.tangentStart).toEqual({ x: -6, y: 0 });
    expect(getVectorNode(vectorId).segments.s1.tangentEnd).toEqual({ x: 10, y: 0 });
  });

  it('should skip a selected handle whose segment no longer belongs to any currently open node', () => {
    // mock — the selected handle used to belong to a node that is no longer open for editing
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorHandlesRef: { current: [{ end: 'end', segmentId: 's1' }] } } });

    store.dispatch(setVectorEditingNodeIds([]));

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 4, 0, false);

    // result — untouched, since no node is open to own the edit
    expect(getVectorNode(vectorId).segments.s1.tangentEnd).toEqual({ x: 10, y: 0 });
  });

  it('should mirror the opposite tangent when the vertex handle mode is symmetric', () => {
    // mock — va is 'symmetric'; moving sa's tangent (one of va's two handles) should also update
    // sb's mirrored tangent
    store.dispatch(
      addNode({
        defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {
          sa: { endId: 'va', id: 'sa', startId: 'v0', tangentEnd: { x: -10, y: 0 }, tangentStart: null },
          sb: { endId: 'vb', id: 'sb', startId: 'va', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
        },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: { va: 'symmetric' },
        vertices: { v0: { id: 'v0', x: -50, y: 0 }, va: { id: 'va', x: 0, y: 0 }, vb: { id: 'vb', x: 50, y: 0 } },
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const mirroredNodeId = rootOrder[rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeIds([mirroredNodeId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorHandlesRef: { current: [{ end: 'end', segmentId: 'sa' }] } } });

    // action — sa.tangentEnd goes from (-10,0) to (-14,0); its mirror sb.tangentStart should flip
    // to point the opposite direction at the same new length (14)
    handleNudgeVectorEdit(store.dispatch, refs, -4, 0, false);

    const node = getVectorNode(mirroredNodeId);

    expect(node.segments.sa.tangentEnd).toEqual({ x: -14, y: 0 });
    expect(node.segments.sb.tangentStart?.x).toBeCloseTo(14);
    expect(node.segments.sb.tangentStart?.y).toBeCloseTo(0);
  });

  it('should do nothing when neither a vertex nor a handle is selected', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs();

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 5, 5, false);

    // result
    expect(getVectorNode(vectorId).vertices.v1).toEqual({ id: 'v1', x: 0, y: 0 });
  });

  it('should invalidate a stale cached multi-select box after nudging vertices, so it recomputes fresh instead of drifting away from the moved points', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({
      vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1', 'v2'] } },
      vectorMultiSelect: {
        vectorMultiSelectBoxRef: { current: { bounds: { height: 0, width: 100, x: 0, y: 0 }, rotation: 0, selectionKey: 'stale' } },
      },
    });

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 5, 0, false);

    // result
    expect(refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toBeNull();
  });

  it('should invalidate a stale cached multi-select box after nudging a handle too', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({
      vectorEdit: { selectedVectorHandlesRef: { current: [{ end: 'end', segmentId: 's1' }] } },
      vectorMultiSelect: {
        vectorMultiSelectBoxRef: { current: { bounds: { height: 0, width: 100, x: 0, y: 0 }, rotation: 0, selectionKey: 'stale' } },
      },
    });

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 4, 0, false);

    // result
    expect(refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toBeNull();
  });

  it('should leave an existing cached multi-select box untouched when nothing is selected to nudge', () => {
    // mock
    const vectorId = addVectorNode();
    const staleBox = { bounds: { height: 0, width: 100, x: 0, y: 0 }, rotation: 0, selectionKey: 'stale' };

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorMultiSelect: { vectorMultiSelectBoxRef: { current: staleBox } } });

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 5, 5, false);

    // result
    expect(refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toBe(staleBox);
  });

  it('should ignore a selected handle whose tangent is null', () => {
    // mock — s2 has no tangents at all
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's2' }] } } });

    // action
    handleNudgeVectorEdit(store.dispatch, refs, 4, 0, false);

    // result — nothing to move, segment untouched
    expect(getVectorNode(vectorId).segments.s2).toEqual({ endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null });
  });
});
