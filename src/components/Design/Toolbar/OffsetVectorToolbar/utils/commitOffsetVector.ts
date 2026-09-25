// store
import { replaceNode, setOffsetVector, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectOffsetVector } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TOffsetVectorNode } from 'utils/canvas/offsetVector/types';
import { TOffsetVectorState } from 'store/design/types';

// utils
import { getOffsetVector } from 'utils/canvas/offsetVector/getOffsetVector';
import { isOffsetVectorNode } from 'utils/canvas/offsetVector/isOffsetVectorNode';

const replaceWithOffsetVector = (dispatch: AppDispatch, node: TOffsetVectorNode, offsetVector: TOffsetVectorState): void => {
  dispatch(replaceNode({ id: node.id, node: getOffsetVector(node, offsetVector.distance, offsetVector.join) }));
  dispatch(setSelection([node.id]));
};

export const commitOffsetVector = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const offsetVector = selectOffsetVector(state);
  const node = offsetVector ? selectNodes(state)[offsetVector.nodeId] : undefined;

  if (offsetVector && isOffsetVectorNode(node)) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    replaceWithOffsetVector(dispatch, node, offsetVector);
    dispatch(endHistoryGesture());
  }

  dispatch(setOffsetVector(null));
};
