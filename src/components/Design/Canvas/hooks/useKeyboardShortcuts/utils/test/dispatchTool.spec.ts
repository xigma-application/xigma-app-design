// store
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { dispatchTool } from '../dispatchTool';

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
    // before
    store.dispatch(setVectorEditingNodeIds(['node-1']));

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
});
