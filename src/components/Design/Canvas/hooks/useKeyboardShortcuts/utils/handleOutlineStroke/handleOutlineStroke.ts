// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { replaceNode } from 'store/design/slice';

// utils
import { getShapeOutlineTargets } from './getShapeOutlineTargets';
import { getTextOutlineTargets } from './getTextOutlineTargets';

export const handleOutlineStroke = async (dispatch: AppDispatch): Promise<void> => {
  const targets = [...getShapeOutlineTargets(), ...(await getTextOutlineTargets())];

  if (targets.length !== 0) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    targets.forEach(({ node, outline }) => dispatch(replaceNode({ id: node.id, node: { ...outline, id: node.id } })));
    dispatch(endHistoryGesture());
  }
};
