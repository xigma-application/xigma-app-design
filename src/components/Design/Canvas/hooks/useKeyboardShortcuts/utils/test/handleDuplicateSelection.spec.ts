// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleDuplicateSelection } from '../handleDuplicateSelection';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 5, y: 5 }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handleDuplicateSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should add an offset clone of every selected node and select the new clones', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    const { nodes, selectedIds } = store.getState().design;

    expect(selectedIds).toHaveLength(1);
    expect(selectedIds).not.toEqual([frameId]);

    const duplicateNode = nodes[selectedIds[0]];

    expect(duplicateNode).toMatchObject({ x: 15, y: 15 });
  });

  it('should be undoable as a single step even though it dispatches multiple nodes and a selection change', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    const nodeCountBeforeDuplicate = Object.keys(store.getState().design.nodes).length;

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    expect(Object.keys(store.getState().design.nodes)).toHaveLength(nodeCountBeforeDuplicate);
    expect(store.getState().design.selectedIds).toEqual([frameId]);
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    addFrameNode();

    const nodeCountBeforeDuplicate = Object.keys(store.getState().design.nodes).length;

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.nodes)).toHaveLength(nodeCountBeforeDuplicate);
  });

  it('should do nothing while a vector node is open for editing', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    const nodeCountBeforeDuplicate = Object.keys(store.getState().design.nodes).length;

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.nodes)).toHaveLength(nodeCountBeforeDuplicate);
  });
});
