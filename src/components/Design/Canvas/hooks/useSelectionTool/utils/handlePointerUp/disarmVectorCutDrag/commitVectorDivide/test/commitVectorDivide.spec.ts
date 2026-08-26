// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorDivide } from '../commitVectorDivide';
import { createCanvasRefs } from '../../../../../../useCanvasRefs/createCanvasRefs';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const addSquareNode = (x: number, filled: boolean): string => {
  const segments = {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
  } as const;
  const vertices = {
    a: { id: 'a', x, y: 0 },
    b: { id: 'b', x: x + 100, y: 0 },
    c: { id: 'c', x: x + 100, y: 100 },
    d: { id: 'd', x, y: 100 },
  };
  // the real loopKey the square's one face would carry once painted — addCutClosingSegment now uses the
  // filledFaceKeys entry itself (which real segments it borders) to decide where to close, so a
  // placeholder string no longer round-trips
  const [face] = deriveVectorFaces({
    fillColor: null,
    filledFaceKeys: [],
    id: `probe-${x}`,
    name: '',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  });

  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: filled ? [getVectorFillLoopKey(face.pieceKeys)] : [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('commitVectorDivide', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should split a filled square into two independently-filled halves when the cut line crosses it twice', () => {
    // mock — square at x=0..100, y=0..100; horizontal cut line through the middle
    const nodeId = addSquareNode(0, true);

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();
    const rootOrderBefore = [...store.getState().design.rootOrder];

    // before
    commitVectorDivide(store.dispatch, { x: -20, y: 50 }, { x: 120, y: 50 }, [nodeId], canvasRefs);

    // result
    const newRootOrder = store.getState().design.rootOrder.filter((id) => !rootOrderBefore.includes(id));
    const resultingIds = [nodeId, ...newRootOrder];

    expect(resultingIds).toHaveLength(2);

    resultingIds.forEach((id) => {
      const node = store.getState().design.nodes[id] as TVectorNode;

      expect(Object.keys(node.vertices)).toHaveLength(4);
      expect(node.filledFaceKeys.length).toBeGreaterThan(0);
    });

    expect([...store.getState().design.vectorEditingNodeIds].sort()).toEqual([...resultingIds].sort());
  });

  it('should leave an unfilled square split into two unfilled halves', () => {
    // mock
    const nodeId = addSquareNode(0, false);

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();
    const rootOrderBefore = [...store.getState().design.rootOrder];

    // before
    commitVectorDivide(store.dispatch, { x: -20, y: 50 }, { x: 120, y: 50 }, [nodeId], canvasRefs);

    // result
    const newRootOrder = store.getState().design.rootOrder.filter((id) => !rootOrderBefore.includes(id));

    [nodeId, ...newRootOrder].forEach((id) => {
      const node = store.getState().design.nodes[id] as TVectorNode;

      expect(node.filledFaceKeys).toEqual([]);
    });
  });

  it('should leave a node completely untouched when the cut line misses its geometry entirely', () => {
    // mock
    const nodeId = addSquareNode(1000, true);
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const rootOrderBefore = [...store.getState().design.rootOrder];

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — cut line stays near x=0, nowhere near this node at x=1000
    commitVectorDivide(store.dispatch, { x: -20, y: 50 }, { x: 120, y: 50 }, [nodeId], canvasRefs);

    // result
    expect(store.getState().design.nodes[nodeId]).toEqual(node);
    expect(store.getState().design.rootOrder).toEqual(rootOrderBefore);
  });

  it('should keep a closed triangle as one node but genuinely sever the one edge the cut line crosses, when it crosses only that edge and no other', () => {
    // mock — triangle a(0,0)-b(100,0)-c(50,100); cut line crosses only edge a-b, near its midpoint
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {
          s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
          s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
          s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
        },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 50, y: 100 } },
      }),
    );

    const { rootOrder: rootOrderBefore } = store.getState().design;
    const nodeId = rootOrderBefore[rootOrderBefore.length - 1];

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — a short vertical line crossing only edge a-b (y=0), well short of reaching edges b-c/c-a
    commitVectorDivide(store.dispatch, { x: 50, y: -10 }, { x: 50, y: 10 }, [nodeId], canvasRefs);

    // result — still one connected node (no new node, the other two edges still keep it one piece), but
    // edge a-b is now genuinely severed into two disconnected segments — two new points at the same
    // coordinate, not one shared pass-through vertex, matching a plain Split click
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const newVertexIds = Object.keys(node.vertices).filter((id) => !['a', 'b', 'c'].includes(id));
    const touchingSegments = Object.values(node.segments).filter(
      (segment) => newVertexIds.includes(segment.startId) || newVertexIds.includes(segment.endId),
    );

    expect(store.getState().design.rootOrder).toEqual(rootOrderBefore);
    expect(Object.keys(node.vertices)).toHaveLength(5);
    expect(Object.keys(node.segments)).toHaveLength(4);
    expect(newVertexIds).toHaveLength(2);
    expect(touchingSegments).toHaveLength(2);
    expect(touchingSegments[0].id).not.toBe(touchingSegments[1].id);
  });

  it('should cut two open nodes in one gesture, only touching the one the line actually crosses', () => {
    // mock — nodeA at x=0 (crossed), nodeB at x=1000 (missed)
    const nodeAId = addSquareNode(0, true);
    const nodeBId = addSquareNode(1000, true);
    const nodeBBefore = store.getState().design.nodes[nodeBId] as TVectorNode;

    store.dispatch(setVectorEditingNodeIds([nodeAId, nodeBId]));

    const canvasRefs = createCanvasRefs();
    const rootOrderBefore = [...store.getState().design.rootOrder];

    // before
    commitVectorDivide(store.dispatch, { x: -20, y: 50 }, { x: 120, y: 50 }, [nodeAId, nodeBId], canvasRefs);

    // result — nodeA split into 2, nodeB untouched, both still open for editing
    const newRootOrder = store.getState().design.rootOrder.filter((id) => !rootOrderBefore.includes(id));

    expect(newRootOrder).toHaveLength(1);
    expect(store.getState().design.nodes[nodeBId]).toEqual(nodeBBefore);
    expect(store.getState().design.vectorEditingNodeIds).toContain(nodeBId);
    expect(store.getState().design.vectorEditingNodeIds).toHaveLength(3);
  });

  it('should reset the vector point/handle/segment selection refs after committing', () => {
    // mock
    const nodeId = addSquareNode(0, true);

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['a'];
    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1'];

    // before
    commitVectorDivide(store.dispatch, { x: -20, y: 50 }, { x: 120, y: 50 }, [nodeId], canvasRefs);

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should keep all three fills when a horizontal cut crosses four segments shared between three adjacent faces (regression: the middle fill used to be dropped)', () => {
    // mock — a "tent": a left triangle, a right triangle, and the middle triangle their slanted edges
    // form together, each painted its own fill; a horizontal cut crosses all four slanted edges at once
    const segments = {
      baseLeft: { endId: 'bm', id: 'baseLeft', startId: 'bl', tangentEnd: null, tangentStart: null },
      baseRight: { endId: 'br', id: 'baseRight', startId: 'bm', tangentEnd: null, tangentStart: null },
      leftDiag: { endId: 'bm', id: 'leftDiag', startId: 'tl', tangentEnd: null, tangentStart: null },
      leftEdge: { endId: 'tl', id: 'leftEdge', startId: 'bl', tangentEnd: null, tangentStart: null },
      rightDiag: { endId: 'bm', id: 'rightDiag', startId: 'tr', tangentEnd: null, tangentStart: null },
      rightEdge: { endId: 'br', id: 'rightEdge', startId: 'tr', tangentEnd: null, tangentStart: null },
      topEdge: { endId: 'tr', id: 'topEdge', startId: 'tl', tangentEnd: null, tangentStart: null },
    } as const;
    const vertices = {
      bl: { id: 'bl', x: 0, y: 100 },
      bm: { id: 'bm', x: 100, y: 100 },
      br: { id: 'br', x: 200, y: 100 },
      tl: { id: 'tl', x: 50, y: 0 },
      tr: { id: 'tr', x: 150, y: 0 },
    };
    const faces = deriveVectorFaces({
      fillColor: null,
      filledFaceKeys: [],
      id: 'tent-probe',
      name: '',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    });

    expect(faces).toHaveLength(3);

    store.dispatch(
      addNode({
        fillColor: '#ff0000',
        filledFaceKeys: faces.map((face) => getVectorFillLoopKey(face.pieceKeys)),
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments,
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices,
      }),
    );

    const { rootOrder: rootOrderBefore } = store.getState().design;
    const nodeId = rootOrderBefore[rootOrderBefore.length - 1];

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — horizontal cut at y=50, between the two peaks (y=0) and the baseline (y=100)
    commitVectorDivide(store.dispatch, { x: -20, y: 50 }, { x: 220, y: 50 }, [nodeId], canvasRefs);

    // result — a top piece (holding both peaks) and a bottom piece (holding the baseline), each keeping
    // its own 3 sub-fills; none of the three original colors, including the middle one, gets dropped
    const newRootOrder = store.getState().design.rootOrder.filter((id) => !rootOrderBefore.includes(id));
    const resultingIds = [nodeId, ...newRootOrder];

    expect(resultingIds).toHaveLength(2);

    resultingIds.forEach((id) => {
      const node = store.getState().design.nodes[id] as TVectorNode;

      expect(node.filledFaceKeys).toHaveLength(3);
    });
  });

  it('should keep the fill when cutting an already-cut piece a second time (regression: the second cut dropped fill entirely on both new pieces)', () => {
    // mock — a tall filled rectangle, cut horizontally into thirds with two separate cuts; the second
    // cut lands on a piece whose own segments are already fragments from the first cut (e.g. "s2#1"),
    // which is exactly the case addCutClosingSegment's per-face crossing match used to miss
    const nodeId = addSquareNode(0, true);

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();
    const rootOrderBeforeAnyCut = [...store.getState().design.rootOrder];

    // before — first cut near the top (y=30), then cut the resulting bottom piece again near its own
    // middle (y=65)
    commitVectorDivide(store.dispatch, { x: -20, y: 30 }, { x: 120, y: 30 }, [nodeId], canvasRefs);

    const afterFirstCutIds = store.getState().design.rootOrder.filter((id) => !rootOrderBeforeAnyCut.includes(id));
    const bottomPieceId = [nodeId, ...afterFirstCutIds]
      .map((id) => store.getState().design.nodes[id] as TVectorNode)
      .find((node) => Math.max(...Object.values(node.vertices).map((v) => v.y)) > 30)!.id;

    commitVectorDivide(store.dispatch, { x: -20, y: 65 }, { x: 120, y: 65 }, [bottomPieceId], canvasRefs);

    // result — three pieces total (top third untouched by the second cut, plus the two the second cut
    // produced), every single one still filled
    const finalIds = store.getState().design.rootOrder.filter((id) => !rootOrderBeforeAnyCut.includes(id) || id === nodeId);

    expect(finalIds).toHaveLength(3);

    finalIds.forEach((id) => {
      const node = store.getState().design.nodes[id] as TVectorNode;

      expect(node.filledFaceKeys.length).toBeGreaterThan(0);
    });
  });

  it('should splice a cut line into the same node as a real chord that cleanly divides one face in two, giving both new pieces their own fill, while the untouched-looking bottom face actually loses its own (its one boundary edge got genuinely severed for the cut’s sake, with nothing on the far side to keep it closed)', () => {
    // mock — a square (v1..v4) already split by an internal chord (mid) into a top and bottom face, both
    // painted their own fill; a vertical line crosses the top edge and the internal chord, splitting the
    // top face in two, but the outline stays one connected piece via the untouched bottom face
    const segments = {
      mid: { endId: 'midR', id: 'mid', startId: 'midL', tangentEnd: null, tangentStart: null },
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
      s2: { endId: 'midR', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      s3: { endId: 'v3', id: 's3', startId: 'midR', tangentEnd: null, tangentStart: null },
      s4: { endId: 'v4', id: 's4', startId: 'v3', tangentEnd: null, tangentStart: null },
      s5: { endId: 'midL', id: 's5', startId: 'v4', tangentEnd: null, tangentStart: null },
      s6: { endId: 'v1', id: 's6', startId: 'midL', tangentEnd: null, tangentStart: null },
    } as const;
    const vertices = {
      midL: { id: 'midL', x: 0, y: 50 },
      midR: { id: 'midR', x: 100, y: 50 },
      v1: { id: 'v1', x: 0, y: 0 },
      v2: { id: 'v2', x: 100, y: 0 },
      v3: { id: 'v3', x: 100, y: 100 },
      v4: { id: 'v4', x: 0, y: 100 },
    };
    const faces = deriveVectorFaces({
      fillColor: null,
      filledFaceKeys: [],
      id: 'chord-probe',
      name: '',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    });

    expect(faces).toHaveLength(2);

    store.dispatch(
      addNode({
        fillColor: '#ff0000',
        filledFaceKeys: faces.map((face) => getVectorFillLoopKey(face.pieceKeys)),
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments,
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices,
      }),
    );

    const { rootOrder: rootOrderBefore } = store.getState().design;
    const nodeId = rootOrderBefore[rootOrderBefore.length - 1];

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — crosses the top edge (y=0) then the internal chord (y=50), stopping well short of the
    // bottom edge (y=100), so the bottom face is never touched
    commitVectorDivide(store.dispatch, { x: 50, y: -20 }, { x: 50, y: 80 }, [nodeId], canvasRefs);

    // result — no new node (the bottom face's other two edges keep the outline connected as one piece),
    // the top face's two new pieces both inherit its fill, and the bottom face — never itself re-closed
    // by this cut — isn't among them
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const bottomKey = faces.find((face) => face.pieceKeys.some((key) => key.startsWith('s4[')))!;

    expect(store.getState().design.rootOrder).toEqual(rootOrderBefore);
    expect(node.filledFaceKeys).toHaveLength(2);
    expect(node.filledFaceKeys).not.toContain(getVectorFillLoopKey(bottomKey.pieceKeys));
    expect(deriveVectorFaces(node)).toHaveLength(2);
  });
});
