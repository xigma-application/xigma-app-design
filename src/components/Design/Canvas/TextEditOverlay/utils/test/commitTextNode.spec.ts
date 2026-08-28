import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// store
import designReducer, { addNode } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { NodeType } from 'types/design/enums';

// utils
import { commitTextNode } from '../commitTextNode';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

describe('commitTextNode', () => {
  it('should add a new text node carrying the path binding when the box is attached to a path', () => {
    // mock
    const store = createTestStore();
    const box = {
      flipX: false,
      flipY: false,
      height: 200,
      pathFlip: false,
      pathId: 'ellipse-1',
      pathStartOffset: 0,
      rotation: 0,
      width: 200,
      x: 0,
      y: 0,
    };

    // action
    commitTextNode(store.dispatch, box, null, 'curved');

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(page.rootOrder).toHaveLength(1);
    expect(page.nodes[page.rootOrder[0]]).toMatchObject({ content: 'curved', pathId: 'ellipse-1' });
  });

  it('should update the existing node in place, not add a new one, when editing an existing node', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        content: 'original',
        fill: '#ffffff',
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
        x: 10,
        y: 10,
      }),
    );

    const [existingId] = store.getState().design.pages[store.getState().design.activePageId].rootOrder;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    // action
    commitTextNode(store.dispatch, box, existingId, 'replaced');

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(page.rootOrder).toEqual([existingId]);
    expect(page.nodes[existingId]).toMatchObject({ content: 'replaced' });
  });
});
