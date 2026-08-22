// store
import { addNode, deleteNode, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { remapVectorFaceFillsAfterGesture } from '../remapVectorFaceFillsAfterGesture';

const addRectangleVectorNode = (filledFaceKeys: string[]): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
        v3: { id: 'v3', x: 100, y: 100 },
        v4: { id: 'v4', x: 0, y: 100 },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('remapVectorFaceFillsAfterGesture', () => {
  it('should do nothing when no snapshot was taken for this gesture', () => {
    // mock
    const selectionRefs = createSelectionToolRefs();

    // before / result — must not throw with a null snapshot
    expect(() => remapVectorFaceFillsAfterGesture(store.dispatch, selectionRefs)).not.toThrow();
    expect(selectionRefs.vectorFaceFillSnapshotRef.current).toBeNull();
  });

  it('should not dispatch when the snapshotted node reference is unchanged (nothing moved this gesture)', () => {
    // mock
    const id = addRectangleVectorNode(['s1,s2,s3,s4']);
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorFaceFillSnapshotRef.current = { [id]: store.getState().design.nodes[id] as TVectorNode };

    const nodeBefore = store.getState().design.nodes[id];

    // before
    remapVectorFaceFillsAfterGesture(store.dispatch, selectionRefs);

    // result
    expect(store.getState().design.nodes[id]).toBe(nodeBefore);
    expect(selectionRefs.vectorFaceFillSnapshotRef.current).toBeNull();
  });

  it('should not crash when the snapshotted node was deleted during the gesture', () => {
    // mock
    const id = addRectangleVectorNode(['s1,s2,s3,s4']);
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorFaceFillSnapshotRef.current = { [id]: store.getState().design.nodes[id] as TVectorNode };
    store.dispatch(deleteNode(id));

    // before / result
    expect(() => remapVectorFaceFillsAfterGesture(store.dispatch, selectionRefs)).not.toThrow();
    expect(store.getState().design.nodes[id]).toBeUndefined();
  });

  it('should not dispatch when the node reference changed but the face topology (and so the fill) is unaffected', () => {
    // mock — an unrelated field (rotation) changes, producing a new node object, but the geometry/face
    // keys themselves are untouched
    const id = addRectangleVectorNode(['s1,s2,s3,s4']);
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorFaceFillSnapshotRef.current = { [id]: store.getState().design.nodes[id] as TVectorNode };
    store.dispatch(updateNode({ changes: { rotation: 45 }, id }));

    const filledFaceKeysBefore = (store.getState().design.nodes[id] as TVectorNode).filledFaceKeys;

    // before
    remapVectorFaceFillsAfterGesture(store.dispatch, selectionRefs);

    // result
    expect((store.getState().design.nodes[id] as TVectorNode).filledFaceKeys).toBe(filledFaceKeysBefore);
  });

  it('should remap a filled rectangle onto both new lobes after a gesture drags it into a self-intersecting shape', () => {
    // mock
    const id = addRectangleVectorNode(['s1,s2,s3,s4']);
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorFaceFillSnapshotRef.current = { [id]: store.getState().design.nodes[id] as TVectorNode };

    // v3/v4 swap corners — same drag as remapFilledFaceKeys.spec.ts's own bowtie fixture
    store.dispatch(
      updateNode({
        changes: {
          vertices: {
            v1: { id: 'v1', x: 0, y: 0 },
            v2: { id: 'v2', x: 100, y: 0 },
            v3: { id: 'v3', x: 0, y: 100 },
            v4: { id: 'v4', x: 100, y: 100 },
          },
        },
        id,
      }),
    );

    // before
    remapVectorFaceFillsAfterGesture(store.dispatch, selectionRefs);

    // result
    const node = store.getState().design.nodes[id] as TVectorNode;

    expect(node.filledFaceKeys).toHaveLength(2);
    expect(node.filledFaceKeys).not.toContain('s1,s2,s3,s4');
    expect(selectionRefs.vectorFaceFillSnapshotRef.current).toBeNull();
  });

  it('should remap when the face count stays the same but the underlying segment id changed', () => {
    // mock — same single-face rectangle, but "s1" is replaced by an equivalent "z1" segment (same
    // start/end, same face count), so only the face KEY changes, not how many faces there are
    const id = addRectangleVectorNode(['s1,s2,s3,s4']);
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorFaceFillSnapshotRef.current = { [id]: store.getState().design.nodes[id] as TVectorNode };

    const oldNode = store.getState().design.nodes[id] as TVectorNode;
    const remainingSegments = Object.fromEntries(Object.entries(oldNode.segments).filter(([segmentId]) => segmentId !== 's1'));

    store.dispatch(
      updateNode({
        changes: {
          segments: { ...remainingSegments, z1: { endId: 'v2', id: 'z1', startId: 'v1', tangentEnd: null, tangentStart: null } },
        },
        id,
      }),
    );

    // before
    remapVectorFaceFillsAfterGesture(store.dispatch, selectionRefs);

    // result
    const node = store.getState().design.nodes[id] as TVectorNode;

    expect(node.filledFaceKeys).toHaveLength(1);
    expect(node.filledFaceKeys).toEqual(['s2,s3,s4,z1']);
    expect(selectionRefs.vectorFaceFillSnapshotRef.current).toBeNull();
  });
});
