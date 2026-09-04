// types
import { NodeType, ToolName } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

const { getTextFlattenVector } = vi.hoisted(() => ({ getTextFlattenVector: vi.fn() }));

vi.mock('utils/canvas/text/fontOutline/getTextFlattenVector', () => ({ getTextFlattenVector }));

// store
import { addNode, setActiveTool, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleEnterVectorEdit } from '../handleEnterVectorEdit';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
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

const addFrameNode = (overrides: { childIds?: string[] } = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 10,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addGroupNode = (childIds: string[]): string => {
  store.dispatch(
    addNode({ childIds, height: 10, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 10, x: 0, y: 0 }),
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

const addTextNode = (overrides: { pathId?: string } = {}): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 40,
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 200,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const buildFlattenedVector = (id: string): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id,
  name: 'Text',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
});

describe('handleEnterVectorEdit', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
    getTextFlattenVector.mockReset().mockResolvedValue(null);
  });

  it('should filter an empty Frame out of the selection on Enter, instead of converting anything', async () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result — a Frame with no children has nothing to drill into, so it's just dropped
    expect(selectActivePage(store.getState()).selectedIds).toEqual([]);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should expand a selected Frame with children into its children on Enter, without converting/entering edit mode yet', async () => {
    // mock
    const rectangleIdA = addRectangleNode();
    const rectangleIdB = addRectangleNode();
    const frameId = addFrameNode({ childIds: [rectangleIdA, rectangleIdB] });

    store.dispatch(setSelection([frameId]));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([rectangleIdA, rectangleIdB]);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(selectActivePage(store.getState()).nodes[rectangleIdA].type).toBe(NodeType.rectangle);
  });

  it('should expand a selected Group with children into its children on Enter, exactly like a Frame', async () => {
    // mock
    const rectangleId = addRectangleNode();
    const groupId = addGroupNode([rectangleId]);

    store.dispatch(setSelection([groupId]));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([rectangleId]);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should undo a drill-into-Frame step, restoring the selection to the Frame itself', async () => {
    // mock
    const rectangleId = addRectangleNode();
    const frameId = addFrameNode({ childIds: [rectangleId] });

    store.dispatch(setSelection([frameId]));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    expect(selectActivePage(store.getState()).selectedIds).toEqual([rectangleId]);

    store.dispatch(undo());

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([frameId]);
  });

  it('should exclude a vector node currently bound as a text-on-path guide, even when selected directly', async () => {
    // mock
    const vectorId = addVectorNode();

    addTextNode({ pathId: vectorId });
    store.dispatch(setSelection([vectorId]));

    // before
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should open a single selected vector node for editing and switch to the Move tool', async () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setSelection([vectorId]));

    // before
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorId]);
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should open every selected vector node for editing and switch to the Move tool when exactly two are selected', async () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addVectorNode();

    store.dispatch(setSelection([vectorIdA, vectorIdB]));

    // before
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB]);
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should first filter out an empty Frame mixed into the selection (one Enter), then open the remaining vectors on the next Enter', async () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addVectorNode();
    const frameId = addFrameNode();

    store.dispatch(setSelection([vectorIdA, frameId, vectorIdB]));

    // action — first Enter: the Frame is a container, so this press only filters it out
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([vectorIdA, vectorIdB]);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);

    // action — second Enter: no containers left, now it opens the vectors
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB]);
  });

  it('should drill through nested Frames one Enter press per level, then convert only once every selected node is a leaf', async () => {
    // mock — R, F[F[R,R]], R: two plain rectangles flanking a frame, that frame's only child is
    // another frame, and that inner frame holds the last two rectangles
    const rectangleId1 = addRectangleNode();
    const rectangleId3 = addRectangleNode();
    const rectangleId4 = addRectangleNode();
    const innerFrameId = addFrameNode({ childIds: [rectangleId3, rectangleId4] });
    const outerFrameId = addFrameNode({ childIds: [innerFrameId] });
    const rectangleId2 = addRectangleNode();

    store.dispatch(setSelection([rectangleId1, outerFrameId, rectangleId2]));

    // action — 1st Enter: only the outer frame is a container; it expands to its one child (the
    // inner frame), the two plain rectangles are left exactly where they are
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    expect(selectActivePage(store.getState()).selectedIds).toEqual([rectangleId1, innerFrameId, rectangleId2]);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);

    // action — 2nd Enter: the inner frame is still a container; it expands to its two rectangles
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    expect(selectActivePage(store.getState()).selectedIds).toEqual([rectangleId1, rectangleId3, rectangleId4, rectangleId2]);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);

    // action — 3rd Enter: every selected node is now a plain rectangle (no containers left), so
    // this press finally converts and opens all four for editing
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    const { nodes } = selectActivePage(store.getState());

    expect(nodes[rectangleId1].type).toBe(NodeType.vector);
    expect(nodes[rectangleId2].type).toBe(NodeType.vector);
    expect(nodes[rectangleId3].type).toBe(NodeType.vector);
    expect(nodes[rectangleId4].type).toBe(NodeType.vector);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([rectangleId1, rectangleId3, rectangleId4, rectangleId2]);
  });

  it('should open every selected vector node when three or more are selected', async () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addVectorNode();
    const vectorIdC = addVectorNode();

    store.dispatch(setSelection([vectorIdA, vectorIdB, vectorIdC]));

    // before
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB, vectorIdC]);
  });

  it('should convert a selected Rectangle into a vector node and open it for editing', async () => {
    // mock
    const rectangleId = addRectangleNode();

    store.dispatch(setSelection([rectangleId]));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId] as TVectorNode;

    expect(node.type).toBe(NodeType.vector);
    expect(node.defaultFill).toEqual([{ color: '#00ff00', opacity: 100, type: 'solid' }]);
    expect(Object.keys(node.vertices)).toHaveLength(4);
    expect(node.filledFaceKeys).toHaveLength(1);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([rectangleId]);
    expect(store.getState().design.pages[store.getState().design.activePageId].rootOrder).toContain(rectangleId);
  });

  it('should convert every eligible shape in a mixed selection, each keeping its own id', async () => {
    // mock
    const rectangleId = addRectangleNode();
    const ellipseId = addEllipseNode();

    store.dispatch(setSelection([rectangleId, ellipseId]));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    const { nodes } = selectActivePage(store.getState());
    const { vectorEditingNodeIds } = store.getState().design;

    expect(nodes[rectangleId].type).toBe(NodeType.vector);
    expect(nodes[ellipseId].type).toBe(NodeType.vector);
    expect(vectorEditingNodeIds).toEqual([rectangleId, ellipseId]);
  });

  it('should flatten a selected Text node into a vector and open it for editing, alongside a converted shape — as separate, un-merged vectors', async () => {
    // mock
    const rectangleId = addRectangleNode();
    const textId = addTextNode();

    store.dispatch(setSelection([rectangleId, textId]));
    getTextFlattenVector.mockResolvedValue(buildFlattenedVector(textId));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    const { nodes } = selectActivePage(store.getState());

    expect(nodes[rectangleId].type).toBe(NodeType.vector);
    expect(nodes[textId].type).toBe(NodeType.vector);
    expect(nodes[textId].id).toBe(textId);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([rectangleId, textId]);
  });

  it('should flatten text bound to a path and delete the now-orphaned path vector, same as the Flatten action', async () => {
    // mock
    const pathId = addVectorNode();
    const textId = addTextNode({ pathId });

    store.dispatch(setSelection([textId]));
    getTextFlattenVector.mockResolvedValue(buildFlattenedVector(textId));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());

    expect(nodes[textId].type).toBe(NodeType.vector);
    expect(nodes[pathId]).toBeUndefined();
    expect(rootOrder).not.toContain(pathId);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([textId]);
  });

  it('should leave a selected Text node alone when it has no flattenable outline (e.g. empty content)', async () => {
    // mock
    const textId = addTextNode();

    store.dispatch(setSelection([textId]));
    getTextFlattenVector.mockResolvedValue(null);

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(selectActivePage(store.getState()).nodes[textId].type).toBe(NodeType.text);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should undo a mixed shape+text flatten as a single step, restoring the original nodes', async () => {
    // mock
    const rectangleId = addRectangleNode();
    const textId = addTextNode();
    const originalRectangle = selectActivePage(store.getState()).nodes[rectangleId];
    const originalText = selectActivePage(store.getState()).nodes[textId];

    store.dispatch(setSelection([rectangleId, textId]));
    getTextFlattenVector.mockResolvedValue(buildFlattenedVector(textId));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    const { nodes } = selectActivePage(store.getState());

    expect(nodes[rectangleId]).toEqual(originalRectangle);
    expect(nodes[textId]).toEqual(originalText);
  });

  it('should undo a shape-to-vector conversion as a single step, restoring the original shape', async () => {
    // mock
    const rectangleId = addRectangleNode();
    const originalNode = store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId];

    store.dispatch(setSelection([rectangleId]));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId]).toEqual(originalNode);
  });

  it('should do nothing while a different tool than the selection/move tool is active', async () => {
    // mock
    const rectangleId = addRectangleNode();

    store.dispatch(setSelection([rectangleId]));
    store.dispatch(setActiveTool(ToolName.hand));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId].type).toBe(NodeType.rectangle);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should do nothing while a vector node is already open for editing', async () => {
    // mock
    const rectangleId = addRectangleNode();

    store.dispatch(setSelection([rectangleId]));
    store.dispatch(setVectorEditingNodeIds(['some-other-node']));

    // action
    await handleEnterVectorEdit(store.dispatch, createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[rectangleId].type).toBe(NodeType.rectangle);
  });
});
