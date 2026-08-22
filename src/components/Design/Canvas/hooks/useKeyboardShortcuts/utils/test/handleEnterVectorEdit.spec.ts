// store
import { addNode, setActiveTool, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { handleEnterVectorEdit } from '../handleEnterVectorEdit';

const addVectorNode = (): string => {
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

  return rootOrder[rootOrder.length - 1];
};

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 10, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handleEnterVectorEdit', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should do nothing when no vector nodes are selected', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    handleEnterVectorEdit(store.dispatch);

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should open a single selected vector node for editing and switch to the Move tool', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setSelection([vectorId]));

    // before
    handleEnterVectorEdit(store.dispatch);

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorId]);
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should open every selected vector node for editing and switch to the Move tool when exactly two are selected', () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addVectorNode();

    store.dispatch(setSelection([vectorIdA, vectorIdB]));

    // before
    handleEnterVectorEdit(store.dispatch);

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB]);
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should only include the vector nodes when the selection mixes vector and non-vector nodes', () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addVectorNode();
    const frameId = addFrameNode();

    store.dispatch(setSelection([vectorIdA, frameId, vectorIdB]));

    // before
    handleEnterVectorEdit(store.dispatch);

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB]);
  });

  it('should open every selected vector node when three or more are selected', () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addVectorNode();
    const vectorIdC = addVectorNode();

    store.dispatch(setSelection([vectorIdA, vectorIdB, vectorIdC]));

    // before
    handleEnterVectorEdit(store.dispatch);

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB, vectorIdC]);
  });
});
