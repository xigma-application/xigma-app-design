import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// store
import designReducer, { addNode } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { NodeType } from 'types/design/enums';

// utils
import { appendLastCreatedNodeToSelection } from '../appendLastCreatedNodeToSelection';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

describe('appendLastCreatedNodeToSelection', () => {
  it('should add the most recently added node to an empty selection', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({ fill: '#FFFFFF', height: 100, name: 'Frame 1', parentId: null, rotation: 0, type: NodeType.frame, width: 100 }),
    );

    // action
    appendLastCreatedNodeToSelection(store.dispatch, store);

    // result
    const { rootOrder, selectedIds } = store.getState().design;

    expect(selectedIds).toEqual([rootOrder[0]]);
  });

  it('should append the most recently added node to an already-selected set, keeping earlier ones selected', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({ fill: '#FFFFFF', height: 100, name: 'Frame 1', parentId: null, rotation: 0, type: NodeType.frame, width: 100 }),
    );
    appendLastCreatedNodeToSelection(store.dispatch, store);

    store.dispatch(
      addNode({ fill: '#FFFFFF', height: 100, name: 'Frame 2', parentId: null, rotation: 0, type: NodeType.frame, width: 100 }),
    );

    // action
    appendLastCreatedNodeToSelection(store.dispatch, store);

    // result
    const { rootOrder, selectedIds } = store.getState().design;

    expect(selectedIds).toEqual([rootOrder[0], rootOrder[1]]);
  });
});
