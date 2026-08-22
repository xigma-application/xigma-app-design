// store
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { enterVectorEditMode } from '../enterVectorEditMode';

describe('enterVectorEditMode', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should set vectorEditingNodeIds and switch to the Move tool when given at least one node id', () => {
    // before
    enterVectorEditMode(store.dispatch, ['v1']);

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual(['v1']);
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should set vectorEditingNodeIds for every given id and switch to the Move tool', () => {
    // before
    enterVectorEditMode(store.dispatch, ['v1', 'v2']);

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual(['v1', 'v2']);
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should do nothing when given an empty list of node ids', () => {
    // before
    enterVectorEditMode(store.dispatch, []);

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
