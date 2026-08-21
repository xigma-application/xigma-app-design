import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// store
import designReducer, {
  addNode,
  setActiveTool,
  setPenActiveVertexId,
  setSelection,
  setVectorEditingNodeId,
  startCommentDraft,
} from 'store/design/slice';
import { store as realStore } from 'store';
import { TDesignState } from 'store/design/types';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { handleLeave } from '../handleLeave';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const addVectorNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): string => {
  realStore.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = realStore.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handleLeave', () => {
  it('should reset the active tool to default and clear the selection', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.frame));
    store.dispatch(setSelection(['node-1']));

    // action
    handleLeave(store.dispatch);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should cancel an open comment draft', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // action
    handleLeave(store.dispatch);

    // result
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  // handleLeave reads state off the real store singleton (not whatever store the dispatch argument
  // belongs to), so these branch-specific cases have to seed that real store directly
  describe('branches driven by the real store singleton', () => {
    afterEach(() => {
      realStore.dispatch(setActiveTool(ToolName.default));
      realStore.dispatch(setPenActiveVertexId(null));
      realStore.dispatch(setVectorEditingNodeId(null));
    });

    it('should clear the active pen vertex, without resetting the active tool, when one is set', () => {
      // mock
      realStore.dispatch(setPenActiveVertexId('vertex-1'));
      realStore.dispatch(setActiveTool(ToolName.pen));

      // action
      handleLeave(realStore.dispatch);

      // result
      expect(realStore.getState().design.penActiveVertexId).toBeNull();
      expect(realStore.getState().design.activeTool).toBe(ToolName.pen);
    });

    it('should delete a dangling, still-unconnected active vertex via handleEscapePenActiveVertex — see its own spec for the full outer/inner-node scenarios', () => {
      // mock
      const vectorId = addVectorNode({}, { v1: { id: 'v1', x: 0, y: 0 } });

      realStore.dispatch(setVectorEditingNodeId(vectorId));
      realStore.dispatch(setPenActiveVertexId('v1'));

      // action
      handleLeave(realStore.dispatch);

      // result
      expect(realStore.getState().design.nodes[vectorId]).toBeUndefined();
      expect(realStore.getState().design.vectorEditingNodeId).toBeNull();
      expect(realStore.getState().design.penActiveVertexId).toBeNull();
    });

    it('should reset the active tool to default when leaving vector editing with the pen tool active', () => {
      // mock
      realStore.dispatch(setVectorEditingNodeId('node-1'));
      realStore.dispatch(setActiveTool(ToolName.pen));

      // action
      handleLeave(realStore.dispatch);

      // result
      expect(realStore.getState().design.activeTool).toBe(ToolName.default);
      expect(realStore.getState().design.vectorEditingNodeId).toBe('node-1');
    });

    it('should clear the vector editing node id when leaving vector editing with a non-pen tool active', () => {
      // mock
      realStore.dispatch(setVectorEditingNodeId('node-1'));

      // action
      handleLeave(realStore.dispatch);

      // result
      expect(realStore.getState().design.vectorEditingNodeId).toBeNull();
    });
  });
});
