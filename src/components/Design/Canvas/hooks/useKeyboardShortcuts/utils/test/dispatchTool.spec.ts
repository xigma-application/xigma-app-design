// store
import { addNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { dispatchTool } from '../dispatchTool';

const addStraightVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('dispatchTool', () => {
  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should switch the active tool when not in Vector Edit Mode', () => {
    // action
    dispatchTool(store.dispatch, ToolName.frame);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.frame);
  });

  it('should switch to an allowed tool while in Vector Edit Mode', () => {
    // before
    store.dispatch(setVectorEditingNodeIds(['node-1']));
    store.dispatch(setActiveTool(ToolName.pen));

    // action
    dispatchTool(store.dispatch, ToolName.move);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should block switching to a tool not allowed in Vector Edit Mode', () => {
    // before
    store.dispatch(setVectorEditingNodeIds(['node-1']));
    store.dispatch(setActiveTool(ToolName.pen));

    // action
    dispatchTool(store.dispatch, ToolName.frame);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.pen);
  });

  it('should allow every tool listed in the Vector Edit Mode whitelist', () => {
    // before — an eligible, non-branching vector node, so Variable Width also passes its own gate
    const nodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // action
    [
      ToolName.pen,
      ToolName.pencil,
      ToolName.lasso,
      ToolName.paint,
      ToolName.move,
      ToolName.bend,
      ToolName.cut,
      ToolName.shapeBuilder,
      ToolName.variableWidth,
    ].forEach((tool) => {
      dispatchTool(store.dispatch, tool);

      // result
      expect(store.getState().design.activeTool).toBe(tool);
    });
  });

  it('should block the Variable Width shortcut when no eligible node is being edited, even though the tool itself is whitelisted', () => {
    // before — whitelisted for Vector Edit Mode, but no node exists for this id at all
    store.dispatch(setVectorEditingNodeIds(['missing-node']));
    store.dispatch(setActiveTool(ToolName.pen));

    // action
    dispatchTool(store.dispatch, ToolName.variableWidth);

    // result — the shortcut must respect the same eligibility gate as the toolbar button/dropdown item
    expect(store.getState().design.activeTool).toBe(ToolName.pen);
  });

  it('should block the Variable Width shortcut when two nodes are being edited simultaneously, even if both are eligible on their own', () => {
    // before
    const firstNodeId = addStraightVectorNode();
    const secondNodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([firstNodeId, secondNodeId]));
    store.dispatch(setActiveTool(ToolName.pen));

    // action
    dispatchTool(store.dispatch, ToolName.variableWidth);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.pen);
  });

  it('should still allow the Shape Builder shortcut with no eligible node at all, since it has no eligibility gate', () => {
    // before
    store.dispatch(setVectorEditingNodeIds(['missing-node']));

    // action
    dispatchTool(store.dispatch, ToolName.shapeBuilder);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.shapeBuilder);
  });
});
