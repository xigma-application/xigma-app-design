// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handleSelectAll } from '../handleSelectAll';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

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

describe('handleSelectAll', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should select every node currently on the canvas', () => {
    // mock
    addFrameNode();
    addFrameNode();

    // action
    handleSelectAll(store.dispatch, createCanvasRefs());

    // result
    expect(selectSelectedIds(store.getState())).toEqual(store.getState().design.pages[store.getState().design.activePageId].rootOrder);
  });

  it('should select every vertex and segment of the editing vector node instead of touching the node selection while a vector node is open for editing', () => {
    // mock
    const idA = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([idA]));

    const canvasRefs = createCanvasRefs();

    // action
    handleSelectAll(store.dispatch, canvasRefs);

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
  });
});
