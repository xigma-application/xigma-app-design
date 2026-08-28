// store
import { addNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleRedo } from '../handleRedo';
import { handleUndo } from '../handleUndo';

describe('handleRedo', () => {
  it('should leave the vector-selection refs untouched when there is nothing to redo', () => {
    // mock
    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['still-here'] } } });

    // action
    handleRedo(store.dispatch, refs);

    // result
    expect(refs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['still-here']);
  });

  it('should restore the pre-undo vector selection onto the refs when something is redone', () => {
    // mock
    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['before-undo-vertex'] } } });

    store.dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );
    store.dispatch(endHistoryGesture());

    handleUndo(store.dispatch, refs);

    refs.vectorEdit.selectedVectorVertexIdsRef.current = ['unrelated-vertex'];

    // action
    handleRedo(store.dispatch, refs);

    // result
    expect(refs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['before-undo-vertex']);
  });
});
