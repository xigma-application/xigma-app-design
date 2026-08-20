// store
import { addNode, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { handleDeleteSelection } from '../handleDeleteSelection';

const createRefs = (selectedVectorVertexIds: string[] = []): TCanvasRefs =>
  createCanvasRefs({ selectedVectorVertexIdsRef: { current: selectedVectorVertexIds } });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        'segment-1': { endId: 'vertex-2', id: 'segment-1', startId: 'vertex-1', tangentEnd: null, tangentStart: null },
        'segment-2': { endId: 'vertex-3', id: 'segment-2', startId: 'vertex-2', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        'vertex-1': { id: 'vertex-1', x: 0, y: 0 },
        'vertex-2': { id: 'vertex-2', x: 10, y: 10 },
        'vertex-3': { id: 'vertex-3', x: 20, y: 20 },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addClosedTriangleVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        ab: { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
        bc: { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
        ca: { endId: 'a', id: 'ca', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 5, y: 10 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handleDeleteSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should delete every selected node', () => {
    // mock
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(50, 50);

    store.dispatch(setSelection([idA, idB]));

    // before
    handleDeleteSelection(store.dispatch, createRefs());

    // result
    expect(store.getState().design.nodes[idA]).toBeUndefined();
    expect(store.getState().design.nodes[idB]).toBeUndefined();
  });

  it('should not delete the selected node when a tangent handle is selected instead of a vertex', () => {
    // mock
    const idA = addFrameNode(0, 0);

    store.dispatch(setSelection([idA]));

    const refs = createCanvasRefs({ selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's1' }] } });

    // before
    handleDeleteSelection(store.dispatch, refs);

    // result — deleting the whole node is reserved for when neither a vertex nor a handle is selected
    expect(store.getState().design.nodes[idA]).toBeDefined();
  });

  it('should restore every deleted node with a single undo', () => {
    // mock
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(50, 50);
    const idC = addFrameNode(100, 100);

    store.dispatch(setSelection([idA, idB, idC]));

    // before
    handleDeleteSelection(store.dispatch, createRefs());
    store.dispatch(undo());

    // result
    expect(store.getState().design.nodes[idA]).toBeDefined();
    expect(store.getState().design.nodes[idB]).toBeDefined();
    expect(store.getState().design.nodes[idC]).toBeDefined();
  });

  it('should remove only the selected vertices (and their segments) when editing a vector node', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(vectorId));

    const refs = createRefs(['vertex-1']);

    // before
    handleDeleteSelection(store.dispatch, refs);

    // result
    const vectorNode = store.getState().design.nodes[vectorId];

    expect(vectorNode).toMatchObject({
      segments: { 'segment-2': { endId: 'vertex-3', id: 'segment-2', startId: 'vertex-2' } },
      vertices: { 'vertex-2': { id: 'vertex-2', x: 10, y: 10 }, 'vertex-3': { id: 'vertex-3', x: 20, y: 20 } },
    });
    expect(refs.selectedVectorVertexIdsRef.current).toEqual([]);
  });

  it('should remove the selected segment and drop the endpoint it leaves with no segment left, but keep an endpoint still held by another segment, when a segment is selected instead of a vertex', () => {
    // mock — vertex-1 -(segment-1)- vertex-2 -(segment-2)- vertex-3; deleting segment-1 leaves vertex-1
    // with zero remaining segments (a floating dangling point) while vertex-2 stays held by segment-2
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(vectorId));

    const refs = createCanvasRefs({ selectedVectorSegmentIdsRef: { current: ['segment-1'] } });

    // before
    handleDeleteSelection(store.dispatch, refs);

    // result — segment-1 (vertex-1 -> vertex-2) is gone along with the now-orphaned vertex-1; segment-2
    // and its two endpoints (vertex-2, vertex-3) are untouched
    const vectorNode = store.getState().design.nodes[vectorId] as TVectorNode;

    expect(Object.keys(vectorNode.segments)).toEqual(['segment-2']);
    expect(Object.keys(vectorNode.vertices)).toEqual(['vertex-2', 'vertex-3']);
    expect(refs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should leave a broken loop unfilled — deleting a vertex that breaks a previously closed (filled) triangle drops its face instead of crashing or keeping a stale fill', () => {
    // mock
    const vectorId = addClosedTriangleVectorNode();

    store.dispatch(setVectorEditingNodeId(vectorId));

    // before — the closed triangle starts out with exactly one fillable face
    const closedNode = store.getState().design.nodes[vectorId] as TVectorNode;

    expect(deriveVectorFaces(closedNode)).toHaveLength(1);

    // action — deleting vertex "a" removes it and both segments touching it (ab, ca), breaking the loop
    handleDeleteSelection(store.dispatch, createRefs(['a']));

    // result
    const brokenNode = store.getState().design.nodes[vectorId] as TVectorNode;

    expect(deriveVectorFaces(brokenNode)).toEqual([]);
  });
});
