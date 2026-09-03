// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { replaceNode } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

// utils
import { convertSectionToFrame } from 'utils/canvas/convertFrameSection/convertSectionToFrame';

export const handleConvertSelectionToFrame = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const nodes = selectNodes(state);
  const sectionNodes = selectSelectedIds(state)
    .map((id) => nodes[id])
    .filter((node): node is TSectionNode => node?.type === NodeType.section);

  if (sectionNodes.length > 0) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    sectionNodes.forEach((node) => dispatch(replaceNode({ id: node.id, node: convertSectionToFrame(node) })));
    dispatch(endHistoryGesture());
  }
};
