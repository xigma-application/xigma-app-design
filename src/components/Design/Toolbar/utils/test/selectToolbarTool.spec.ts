// store
import { setActiveTool, setPenActiveVertexId, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { selectToolbarTool } from '../selectToolbarTool';

describe('selectToolbarTool', () => {
  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should switch the active tool when not in Vector Edit Mode', () => {
    // action
    selectToolbarTool(store.dispatch, ToolName.frame, createCanvasRefs());

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.frame);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should switch to a pen-group tool without leaving Vector Edit Mode', () => {
    // before
    store.dispatch(setVectorEditingNodeIds(['node-1']));

    // action
    selectToolbarTool(store.dispatch, ToolName.pencil, createCanvasRefs());

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.pencil);
    expect(store.getState().design.vectorEditingNodeIds).toEqual(['node-1']);
  });

  it('should switch to a non-pen tool and leave Vector Edit Mode', () => {
    // before
    store.dispatch(setVectorEditingNodeIds(['node-1']));

    // action
    selectToolbarTool(store.dispatch, ToolName.rectangle, createCanvasRefs());

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.rectangle);
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should clear the active pen vertex and staged preview refs when leaving Vector Edit Mode mid-draw', () => {
    // before — same cleanup Escape does (handleLeave.ts), now also needed from a toolbar click
    store.dispatch(setVectorEditingNodeIds(['node-1']));
    store.dispatch(setPenActiveVertexId('vertex-1'));

    const refs = createCanvasRefs();

    refs.penNewVertexPreviewRef.current = { x: 5, y: 5 };

    // action
    selectToolbarTool(store.dispatch, ToolName.frame, refs);

    // result
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(refs.penNewVertexPreviewRef.current).toBeNull();
  });

  it('should not touch the active pen vertex when switching within the pen group', () => {
    // before
    store.dispatch(setVectorEditingNodeIds(['node-1']));
    store.dispatch(setPenActiveVertexId('vertex-1'));

    // action
    selectToolbarTool(store.dispatch, ToolName.pencil, createCanvasRefs());

    // result
    expect(store.getState().design.penActiveVertexId).toBe('vertex-1');
  });
});
