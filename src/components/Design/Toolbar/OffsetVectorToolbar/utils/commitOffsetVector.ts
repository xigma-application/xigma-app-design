// store
import { replaceNode, setOffsetVector, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectOffsetVector } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TLineNode } from 'types/design/types';
import { TOffsetVectorState } from 'store/design/types';

// utils
import { getLineOffsetVector } from 'utils/canvas/line/getLineOffsetVector';
import { isLineNode } from 'utils/canvas/line/isLineNode';

const replaceLineWithOffsetVector = (dispatch: AppDispatch, line: TLineNode, offsetVector: TOffsetVectorState): void => {
  dispatch(replaceNode({ id: line.id, node: { ...getLineOffsetVector(line, offsetVector.distance, offsetVector.join), id: line.id } }));
  dispatch(setSelection([line.id]));
};

export const commitOffsetVector = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const offsetVector = selectOffsetVector(state);
  const line = offsetVector ? selectNodes(state)[offsetVector.nodeId] : undefined;

  if (offsetVector && isLineNode(line)) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    replaceLineWithOffsetVector(dispatch, line, offsetVector);
    dispatch(endHistoryGesture());
  }

  dispatch(setOffsetVector(null));
};
