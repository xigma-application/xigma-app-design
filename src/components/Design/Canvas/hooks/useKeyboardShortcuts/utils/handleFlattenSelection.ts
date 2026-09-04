// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { deleteNode, replaceNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectSelectedNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// utils
import { convertNodeToVector, isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';
import { getTextFlattenTargets } from './getTextFlattenTargets';

export const handleFlattenSelection = async (dispatch: AppDispatch): Promise<void> => {
  const shapeNodes = selectSelectedNodes(store.getState()).filter(isConvertibleToVectorNode);
  const textTargets = await getTextFlattenTargets();

  if (shapeNodes.length === 0 && textTargets.length === 0) {
    return;
  }

  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  shapeNodes.forEach((node) => dispatch(replaceNode({ id: node.id, node: convertNodeToVector(node) })));
  textTargets.forEach(({ node, vector }) => dispatch(replaceNode({ id: node.id, node: { ...vector, id: node.id } })));
  textTargets.forEach(({ node }) => {
    if (node.pathId) {
      dispatch(deleteNode(node.pathId));
    }
  });
  dispatch(endHistoryGesture());
};
