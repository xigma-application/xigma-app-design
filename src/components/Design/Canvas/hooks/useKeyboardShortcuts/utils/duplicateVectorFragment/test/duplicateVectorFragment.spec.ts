// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { duplicateVectorFragment } from '../duplicateVectorFragment';
import { getVectorFillLoopPoints } from 'utils/canvas/vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('duplicateVectorFragment', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should merge an offset clone of the selected segment into the same node and select the clones', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs();

    // action
    duplicateVectorFragment(
      store.dispatch,
      refs,
      store.getState().design.pages[store.getState().design.activePageId].nodes,
      [vectorId],
      [],
      ['s1'],
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId] as any;

    expect(Object.keys(node.vertices)).toHaveLength(4);
    expect(Object.keys(node.segments)).toHaveLength(2);
    expect(refs.vectorEdit.selectedVectorVertexIdsRef.current).toHaveLength(2);
    expect(refs.vectorEdit.selectedVectorSegmentIdsRef.current).toHaveLength(1);
    expect(refs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should be undoable as a single step even though it duplicates a vertex and a connected segment together', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs();

    // action
    duplicateVectorFragment(
      store.dispatch,
      refs,
      store.getState().design.pages[store.getState().design.activePageId].nodes,
      [vectorId],
      ['v1'],
      ['s1'],
    );
    store.dispatch(undo());

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId] as any;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(Object.keys(node.segments)).toHaveLength(1);
  });

  // real, live-reported bug: a shape made of two curves sharing both endpoints (a "lens", not a
  // 3+-sided polygon) left its duplicate unfilled — getDuplicatedFilledFaceKeys was re-deriving faces
  // on the merged node instead of remapping the already-known-good original key, and re-deriving broke
  // once the duplicate's own offset geometry started overlapping the original inside that merged node
  it('should carry the fill over onto a duplicated lens shape (two segments sharing both endpoints)', () => {
    // mock
    const segments = {
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -91, y: -59 }, tangentStart: { x: 100, y: -220.5 } },
      s2: { endId: 'v1', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: { x: 91, y: 59 } },
    };
    const vertices = { v1: { id: 'v1', x: 902, y: 968 }, v2: { id: 'v2', x: 816.5, y: 950.5 } };
    const filledFaceKeys = ['s1[v:v1|v:v2],s2[v:v1|v:v2]'];

    store.dispatch(
      addNode({
        defaultFill: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
        filledFaceKeys,
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments,
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: { v1: 'symmetric', v2: 'symmetric' },
        vertices,
      } as any),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const vectorId = rootOrder[rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs();

    // action
    duplicateVectorFragment(
      store.dispatch,
      refs,
      store.getState().design.pages[store.getState().design.activePageId].nodes,
      [vectorId],
      ['v1', 'v2'],
      [],
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId] as any;

    expect(node.filledFaceKeys).toHaveLength(2);

    const newKey = node.filledFaceKeys.find((key: string) => key !== filledFaceKeys[0]);

    expect(getVectorFillLoopPoints(node, newKey)).not.toBeNull();
  });
});
