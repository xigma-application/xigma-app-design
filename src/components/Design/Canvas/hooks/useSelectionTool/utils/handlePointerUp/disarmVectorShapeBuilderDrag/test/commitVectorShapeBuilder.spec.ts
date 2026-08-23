// store
import { deleteNode, setVectorEditingNodeIds, updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { commitVectorShapeBuilder } from '../commitVectorShapeBuilder';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

// wraps a single-node call so every existing (pre-cross-node) test keeps its original 4-arg shape at
// the call site, while the function itself now also needs rootOrder/vectorEditingNodeIds/path/isBoxMode
const commitSingleNode = (
  dispatch: Parameters<typeof commitVectorShapeBuilder>[0],
  nodes: Record<string, TSceneNode>,
  touchedFaces: Parameters<typeof commitVectorShapeBuilder>[4],
  isSubtract: boolean,
): string[] =>
  commitVectorShapeBuilder(
    dispatch,
    nodes,
    Object.keys(touchedFaces),
    Object.keys(nodes),
    touchedFaces,
    isSubtract,
    [{ x: 0, y: 0 }],
    false,
  );

// mock — a 100x100 rectangle split in half by a horizontal "divider" segment (e-f), forming a top
// and a bottom face that share exactly that one segment
const splitRectangleNode: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'n1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    bottom: { endId: 'd', id: 'bottom', startId: 'c', tangentEnd: null, tangentStart: null },
    divider: { endId: 'f', id: 'divider', startId: 'e', tangentEnd: null, tangentStart: null },
    leftLower: { endId: 'e', id: 'leftLower', startId: 'd', tangentEnd: null, tangentStart: null },
    leftUpper: { endId: 'a', id: 'leftUpper', startId: 'e', tangentEnd: null, tangentStart: null },
    rightLower: { endId: 'c', id: 'rightLower', startId: 'f', tangentEnd: null, tangentStart: null },
    rightUpper: { endId: 'f', id: 'rightUpper', startId: 'b', tangentEnd: null, tangentStart: null },
    top: { endId: 'b', id: 'top', startId: 'a', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
    e: { id: 'e', x: 0, y: 50 },
    f: { id: 'f', x: 100, y: 50 },
  },
};

describe('commitVectorShapeBuilder', () => {
  it('should merge every touched face for a node and dispatch a single updateNode', () => {
    // mock — both faces touched (their derived keys, "s1,s2,..." style)
    const nodes: Record<string, TSceneNode> = { n1: splitRectangleNode };
    const dispatch = vi.fn();

    // before — face keys are the sorted-segment-id strings deriveVectorFaces would produce internally
    const touchedFaces = { n1: new Set(['bottom,divider,leftLower,rightLower', 'divider,leftUpper,rightUpper,top']) };

    // action
    commitSingleNode(dispatch, nodes, touchedFaces, false);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);

    const action = (dispatch.mock.calls[0] as [ReturnType<typeof updateNode>])[0];
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(action.payload.id).toBe('n1');
    expect(changes.segments?.divider).toBeUndefined();
    expect(changes.filledFaceKeys).toHaveLength(1);
  });

  it('should not dispatch when the touched face-key set matches nothing on the node', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { n1: splitRectangleNode };
    const dispatch = vi.fn();
    const touchedFaces = { n1: new Set(['does-not-exist']) };

    // action
    commitSingleNode(dispatch, nodes, touchedFaces, false);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch for a node whose touched face-key set is empty', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { n1: splitRectangleNode };
    const dispatch = vi.fn();
    const touchedFaces = { n1: new Set<string>() };

    // action
    commitSingleNode(dispatch, nodes, touchedFaces, false);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch for a node id that no longer resolves to a vector node', () => {
    // mock
    const nodes: Record<string, TSceneNode> = {};
    const dispatch = vi.fn();
    const touchedFaces = { missing: new Set(['bottom,divider,leftLower,rightLower']) };

    // action
    commitSingleNode(dispatch, nodes, touchedFaces, false);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should skip any rootOrder id that touchedFaces never recorded at all — most scene nodes on any given gesture', () => {
    // mock — n1 is in rootOrder but was never part of this Shape Builder gesture
    const nodes: Record<string, TSceneNode> = { n1: splitRectangleNode };
    const dispatch = vi.fn();
    const touchedFaces = {};

    // action
    commitVectorShapeBuilder(dispatch, nodes, ['n1'], ['n1'], touchedFaces, false, [{ x: 0, y: 0 }], false);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should subtract the touched face — deleting its own exclusive boundary but keeping the divider shared with the untouched neighbor — instead of merging, when isSubtract is true', () => {
    // mock — one face already filled, using the real piece-key loop-key format filledFaceKeys stores
    const [touchedFace] = deriveVectorFaces(splitRectangleNode).filter((face) => face.key === 'divider,leftUpper,rightUpper,top');
    const filledNode: TVectorNode = { ...splitRectangleNode, filledFaceKeys: [getVectorFillLoopKey(touchedFace.pieceKeys)] };
    const nodes: Record<string, TSceneNode> = { n1: filledNode };
    const dispatch = vi.fn();
    const touchedFaces = { n1: new Set(['divider,leftUpper,rightUpper,top']) };

    // action
    commitSingleNode(dispatch, nodes, touchedFaces, true);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);

    const action = (dispatch.mock.calls[0] as [ReturnType<typeof updateNode>])[0];
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual([]);
    expect(Object.keys(changes.segments ?? {}).sort()).toEqual(['bottom', 'divider', 'leftLower', 'rightLower']);
  });

  // two 150x200 rectangles staggered by (75,100), as two SEPARATE nodes rather than one — same
  // proportions as mergeVectorFaces.spec.ts's own crossingRectanglesNode regression fixture, which
  // proved this exact overlap planarizes into exactly 3 faces
  // segment/vertex ids are prefixed per node — in the real app these are nanoid()-generated and
  // globally unique across every node in the scene; reusing 's1'/'v1' etc. for two different nodes
  // here would silently collide when their segments/vertices get unioned for crossing detection
  const buildRectangleNode = (id: string, offsetX: number, offsetY: number): TVectorNode => ({
    fillColor: null,
    filledFaceKeys: [],
    id,
    name: 'Vector',
    parentId: null,
    rotation: 0,
    segments: {
      [`${id}s1`]: { endId: `${id}v2`, id: `${id}s1`, startId: `${id}v1`, tangentEnd: null, tangentStart: null },
      [`${id}s2`]: { endId: `${id}v3`, id: `${id}s2`, startId: `${id}v2`, tangentEnd: null, tangentStart: null },
      [`${id}s3`]: { endId: `${id}v4`, id: `${id}s3`, startId: `${id}v3`, tangentEnd: null, tangentStart: null },
      [`${id}s4`]: { endId: `${id}v1`, id: `${id}s4`, startId: `${id}v4`, tangentEnd: null, tangentStart: null },
    },
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices: {
      [`${id}v1`]: { id: `${id}v1`, x: offsetX, y: offsetY },
      [`${id}v2`]: { id: `${id}v2`, x: offsetX + 150, y: offsetY },
      [`${id}v3`]: { id: `${id}v3`, x: offsetX + 150, y: offsetY + 200 },
      [`${id}v4`]: { id: `${id}v4`, x: offsetX, y: offsetY + 200 },
    },
  });

  it('should merge two crossing (overlapping) open nodes into one — the lower-id survivor absorbs the other, which gets deleted and pruned from vectorEditingNodeIds', () => {
    // mock — r1 at (0,0), r2 staggered by (75,100); a path sweeping r1-only, the overlap, and
    // r2-only touches all 3 faces the combined geometry actually derives
    const nodeA = buildRectangleNode('n1', 0, 0);
    const nodeB = buildRectangleNode('n2', 75, 100);
    const nodes: Record<string, TSceneNode> = { n1: nodeA, n2: nodeB };
    const dispatch = vi.fn();
    const touchedFaces = { n1: new Set(['n1s1,n1s2,n1s3,n1s4']), n2: new Set(['n2s1,n2s2,n2s3,n2s4']) };
    const path = [
      { x: 25, y: 25 },
      { x: 100, y: 150 },
      { x: 200, y: 250 },
    ];

    // action
    const absorbed = commitVectorShapeBuilder(dispatch, nodes, ['n1', 'n2'], ['n1', 'n2'], touchedFaces, false, path, false);

    // result
    expect(absorbed).toEqual(['n2']);

    const updateAction = dispatch.mock.calls.find((call) => call[0].type === updateNode.type)![0] as ReturnType<typeof updateNode>;
    const deleteAction = dispatch.mock.calls.find((call) => call[0].type === deleteNode.type)![0] as ReturnType<typeof deleteNode>;
    const pruneAction = dispatch.mock.calls.find((call) => call[0].type === setVectorEditingNodeIds.type)![0] as ReturnType<
      typeof setVectorEditingNodeIds
    >;
    const changes = updateAction.payload.changes as Partial<TVectorNode>;

    expect(updateAction.payload.id).toBe('n1'); // n1 is the lower-id (first in rootOrder) survivor
    expect(deleteAction.payload).toBe('n2');
    expect(pruneAction.payload).toEqual(['n1']);
    expect(changes.filledFaceKeys).toHaveLength(1); // the 3 sub-regions merged into one
  });

  it('should subtract only the crossing sub-region under the path, still combining the two nodes into one since the crossing had to be materialized either way', () => {
    // mock — same staggered pair, but the path only touches the overlap sliver
    const nodeA = buildRectangleNode('n1', 0, 0);
    const nodeB = buildRectangleNode('n2', 75, 100);
    const nodes: Record<string, TSceneNode> = { n1: nodeA, n2: nodeB };
    const dispatch = vi.fn();
    const touchedFaces = { n1: new Set(['n1s1,n1s2,n1s3,n1s4']), n2: new Set(['n2s1,n2s2,n2s3,n2s4']) };
    const path = [{ x: 100, y: 150 }]; // dead center of the overlap only

    // action
    const absorbed = commitVectorShapeBuilder(dispatch, nodes, ['n1', 'n2'], ['n1', 'n2'], touchedFaces, true, path, false);

    // result
    expect(absorbed).toEqual(['n2']);

    const updateAction = dispatch.mock.calls.find((call) => call[0].type === updateNode.type)![0] as ReturnType<typeof updateNode>;
    const changes = updateAction.payload.changes as Partial<TVectorNode>;

    // the overlap's own exclusive boundary is gone, but each rectangle's own outer edges (shared with
    // nothing, or with the still-standing non-overlap regions) survive — still 2 distinct remaining faces
    expect(changes.filledFaceKeys).toHaveLength(0);
    expect(Object.keys(changes.segments ?? {}).length).toBeGreaterThan(0);
  });

  it('should still combine with an untouched but crossing neighbor when only ONE node is touched — live-caught regression: Alt-clicking only the exclusive corner of node B (never touching untouched-but-crossing node A) used to treat B as fully isolated and delete its whole boundary instead of protecting the shared chord', () => {
    // mock — same staggered pair; only n2 (B) is touched, at a point entirely outside n1 (A)'s own
    // bounds (A spans x:0-150,y:0-200; this point is x>150, clearly B-only)
    const nodeA = buildRectangleNode('n1', 0, 0);
    const nodeB = buildRectangleNode('n2', 75, 100);
    const nodes: Record<string, TSceneNode> = { n1: nodeA, n2: nodeB };
    const dispatch = vi.fn();
    const touchedFaces = { n2: new Set(['n2s1,n2s2,n2s3,n2s4']) }; // n1 never appears at all
    const path = [{ x: 200, y: 250 }]; // B-only region

    // action
    const absorbed = commitVectorShapeBuilder(dispatch, nodes, ['n1', 'n2'], ['n1', 'n2'], touchedFaces, true, path, false);

    // result — n2 still gets absorbed into n1, since materializing the crossing needs both regardless
    // of whether n1 itself had any touched faces
    expect(absorbed).toEqual(['n2']);

    const updateAction = dispatch.mock.calls.find((call) => call[0].type === updateNode.type)![0] as ReturnType<typeof updateNode>;
    const deleteAction = dispatch.mock.calls.find((call) => call[0].type === deleteNode.type)![0] as ReturnType<typeof deleteNode>;
    const pruneAction = dispatch.mock.calls.find((call) => call[0].type === setVectorEditingNodeIds.type)![0] as ReturnType<
      typeof setVectorEditingNodeIds
    >;
    const changes = updateAction.payload.changes as Partial<TVectorNode>;
    const segmentIds = Object.keys(changes.segments ?? {});

    expect(updateAction.payload.id).toBe('n1');
    expect(deleteAction.payload).toBe('n2');
    expect(pruneAction.payload).toEqual(['n1']);
    // n1 was never touched, so every one of its own pieces survives (crossing materialization splits
    // some of them into "#0"/"#1" pieces, but deletes none) — every surviving piece still traces back
    // to n1's own 4 real segments. n2's own exclusive pieces are gone; only the chord piece(s) it
    // shares with the untouched overlap region survive.
    const realSegmentIds = new Set(segmentIds.map((id) => id.split('#')[0]));

    expect(['n1s1', 'n1s2', 'n1s3', 'n1s4'].every((id) => realSegmentIds.has(id))).toBe(true); // every n1 edge survives as some piece
    expect(segmentIds.some((id) => id.startsWith('n2'))).toBe(true); // at least one surviving n2 chord piece
    expect(segmentIds.some((id) => id === 'n2s2' || id === 'n2s3')).toBe(false); // n2's own far/exclusive edges are gone
  });

  it('should NOT combine two touched nodes that never actually cross — each keeps its own independent merge, no deletion or vectorEditingNodeIds change', () => {
    // mock — two rectangles far apart, both touched by the same gesture but never overlapping
    const nodeA = buildRectangleNode('n1', 0, 0);
    const nodeB = buildRectangleNode('n2', 1000, 0);
    const nodes: Record<string, TSceneNode> = { n1: nodeA, n2: nodeB };
    const dispatch = vi.fn();
    const touchedFaces = { n1: new Set(['n1s1,n1s2,n1s3,n1s4']), n2: new Set(['n2s1,n2s2,n2s3,n2s4']) };
    const path = [
      { x: 25, y: 25 },
      { x: 1025, y: 25 },
    ];

    // action
    const absorbed = commitVectorShapeBuilder(dispatch, nodes, ['n1', 'n2'], ['n1', 'n2'], touchedFaces, false, path, false);

    // result
    expect(absorbed).toEqual([]);
    expect(dispatch.mock.calls.filter((call) => call[0].type === deleteNode.type)).toHaveLength(0);
    expect(dispatch.mock.calls.filter((call) => call[0].type === setVectorEditingNodeIds.type)).toHaveLength(0);

    const updateActions = dispatch.mock.calls.filter((call) => call[0].type === updateNode.type).map((call) => call[0].payload.id);

    expect(updateActions.sort()).toEqual(['n1', 'n2']); // each node updated independently
  });
});
