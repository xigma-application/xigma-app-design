import { nanoid } from '@reduxjs/toolkit';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { addNodes, deleteNode, groupNodes, replaceNode, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// utils
import { getShapeOutlineTargets } from './getShapeOutlineTargets';
import { getTextOutlineTargets } from './getTextOutlineTargets';

export const handleOutlineStroke = async (dispatch: AppDispatch): Promise<void> => {
  const shapeTargets = getShapeOutlineTargets();
  const textTargets = await getTextOutlineTargets();

  if (!(shapeTargets.length === 0 && textTargets.length === 0)) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    shapeTargets.forEach(({ node, outline }) => dispatch(replaceNode({ id: node.id, node: { ...outline, id: node.id } })));

    textTargets.forEach(({ letters, node }) => {
      const [first, ...rest] = letters;
      dispatch(replaceNode({ id: node.id, node: { ...first, id: node.id, parentId: node.parentId } }));

      if (rest.length > 0) {
        const restIds = rest.map(() => nanoid());
        const restNodes = rest.map((letter, index) => ({ ...letter, id: restIds[index], parentId: null }));

        dispatch(addNodes({ nodes: restNodes, rootIds: restIds }));
        dispatch(setSelection([node.id, ...restIds]));
        dispatch(groupNodes());
      }

      if (node.pathId) {
        dispatch(deleteNode(node.pathId));
      }
    });

    dispatch(endHistoryGesture());
  }

  return;
};
