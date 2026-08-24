// store
import { addNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleUndo } from '../handleUndo';

describe('handleUndo', () => {
  it('should leave the vector-selection refs untouched when there is nothing to undo', () => {
    // mock
    const refs = createCanvasRefs({ selectedVectorVertexIdsRef: { current: ['still-here'] } });

    // action
    handleUndo(store.dispatch, refs);

    // result
    expect(refs.selectedVectorVertexIdsRef.current).toEqual(['still-here']);
  });

  it('should restore the pre-gesture vector selection onto the refs when something is undone', () => {
    // mock
    const refs = createCanvasRefs({ selectedVectorVertexIdsRef: { current: ['pre-gesture-vertex'] } });

    store.dispatch(
      beginHistoryGesture({ selectedVectorHandles: [], selectedVectorSegmentIds: [], selectedVectorVertexIds: ['pre-gesture-vertex'] }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );
    store.dispatch(endHistoryGesture());

    refs.selectedVectorVertexIdsRef.current = ['different-vertex'];

    // action
    handleUndo(store.dispatch, refs);

    // result
    expect(refs.selectedVectorVertexIdsRef.current).toEqual(['pre-gesture-vertex']);
  });
});
