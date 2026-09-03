// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { moveNodes, replaceNode } from 'store/design/slice';
import { selectActivePage, selectNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { convertFrameToSection } from 'utils/canvas/convertFrameSection/convertFrameToSection';

export const handleConvertSelectionToSection = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const nodes = selectNodes(state);
  const frameNodes = selectSelectedIds(state)
    .map((id) => nodes[id])
    .filter((node): node is TFrameNode => node?.type === NodeType.frame);

  if (frameNodes.length > 0) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    frameNodes.forEach((node) => {
      if (node.childIds.length > 0) {
        const { rootOrder } = selectActivePage(store.getState());
        dispatch(moveNodes({ nodeIds: node.childIds, targetIndex: rootOrder.length, targetParentId: null }));
      }

      dispatch(replaceNode({ id: node.id, node: convertFrameToSection({ ...node, childIds: [] }) }));
    });
    dispatch(endHistoryGesture());
  }
};
