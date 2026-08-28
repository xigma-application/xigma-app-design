// store
import { addNode, setActiveTool, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 10, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectangleNode = (): string => {
  store.dispatch(
    addNode({
      fill: '#00ff00',
      height: 40,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 40,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addEllipseNode = (): string => {
  store.dispatch(
    addNode({ fill: '#0000ff', height: 30, name: 'Ellipse', parentId: null, rotation: 0, type: NodeType.ellipse, width: 30, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleEnterVectorEdit', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should do nothing when no vector or convertible nodes are selected', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should open a single selected vector node for editing and switch to the Move tool', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setSelection([vectorId]));

    // before
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

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
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB]);
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should only include the vector nodes when the selection mixes vector and non-convertible nodes', () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addVectorNode();
    const frameId = addFrameNode();

    store.dispatch(setSelection([vectorIdA, frameId, vectorIdB]));

    // before
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

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
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB, vectorIdC]);
  });

  it('should convert a selected Rectangle into a vector node and open it for editing', () => {
    // mock
    const rectangleId = addRectangleNode();

    store.dispatch(setSelection([rectangleId]));

    // action
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId] as TVectorNode;

    expect(node.type).toBe(NodeType.vector);
    expect(node.fillColor).toBe('#00ff00');
    expect(Object.keys(node.vertices)).toHaveLength(4);
    expect(node.filledFaceKeys).toHaveLength(1);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([rectangleId]);
    expect(store.getState().design.pages[store.getState().design.activePageId].rootOrder).toContain(rectangleId);
  });

  it('should convert every eligible shape in a mixed selection, each keeping its own id', () => {
    // mock
    const rectangleId = addRectangleNode();
    const ellipseId = addEllipseNode();

    store.dispatch(setSelection([rectangleId, ellipseId]));

    // action
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    const { nodes } = selectActivePage(store.getState());
    const { vectorEditingNodeIds } = store.getState().design;

    expect(nodes[rectangleId].type).toBe(NodeType.vector);
    expect(nodes[ellipseId].type).toBe(NodeType.vector);
    expect(vectorEditingNodeIds).toEqual([rectangleId, ellipseId]);
  });

  it('should undo a shape-to-vector conversion as a single step, restoring the original shape', () => {
    // mock
    const rectangleId = addRectangleNode();
    const originalNode = store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId];

    store.dispatch(setSelection([rectangleId]));

    // action
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId]).toEqual(originalNode);
  });

  it('should do nothing while a different tool than the selection/move tool is active', () => {
    // mock
    const rectangleId = addRectangleNode();

    store.dispatch(setSelection([rectangleId]));
    store.dispatch(setActiveTool(ToolName.hand));

    // action
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId].type).toBe(NodeType.rectangle);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should do nothing while a vector node is already open for editing', () => {
    // mock
    const rectangleId = addRectangleNode();

    store.dispatch(setSelection([rectangleId]));
    store.dispatch(setVectorEditingNodeIds(['some-other-node']));

    // action
    handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId].type).toBe(NodeType.rectangle);
  });
});
