import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// store
import designReducer, { addNode } from 'store/design/slice';
import { TDesignState } from 'store/design/types';
import { selectSelectedIds } from 'store/design/selectors';

// types
import { NodeType } from 'types/design/enums';

// utils
import { selectCommittedNode } from '../selectCommittedNode';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

describe('selectCommittedNode', () => {
  it('should select the existing node directly when editingNodeId is set', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        content: 'a',
        fill: '#fff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 20,
        name: 'Text',
        parentId: null,
        rotation: 0,
        type: NodeType.text,
        width: 100,
        x: 0,
        y: 0,
      }),
    );

    const [existingId] = store.getState().design.pages[store.getState().design.activePageId].rootOrder;

    // action
    selectCommittedNode(store.dispatch, store, existingId);

    // result
    expect(selectSelectedIds(store.getState())).toEqual([existingId]);
  });

  it('should select the most recently created node when editingNodeId is null', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({ fill: '#fff', height: 100, name: 'Frame 1', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 100, x: 0, y: 0 }),
    );

    // action
    selectCommittedNode(store.dispatch, store, null);

    // result
    const { design } = store.getState();
    const { rootOrder } = design.pages[design.activePageId];
    const { selectedIds } = design.pages[design.activePageId];

    expect(selectedIds).toEqual([rootOrder[0]]);
  });
});
