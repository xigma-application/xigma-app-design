import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// store
import designReducer, { setActiveTool, setSelection, startCommentDraft } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { ToolName } from 'types/design/enums';

// utils
import { handleLeave } from '../handleLeave';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

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
});
