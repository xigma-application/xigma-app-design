import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// store
import designReducer, { addNode } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { NodeType } from 'types/design/enums';

// utils
import { selectLastCreatedNode } from '../selectLastCreatedNode';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

describe('selectLastCreatedNode', () => {
  it('should select the most recently added node', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({ fill: '#FFFFFF', height: 100, name: 'Frame 1', parentId: null, rotation: 0, type: NodeType.frame, width: 100, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#FFFFFF', height: 100, name: 'Frame 2', parentId: null, rotation: 0, type: NodeType.frame, width: 100, x: 0, y: 0 }),
    );

    // action
    selectLastCreatedNode(store.dispatch, store);

    // result
    const { rootOrder, selectedIds } = store.getState().design;

    expect(selectedIds).toEqual([rootOrder[1]]);
  });
});
