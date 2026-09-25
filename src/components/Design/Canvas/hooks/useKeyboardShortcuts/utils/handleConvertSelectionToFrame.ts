// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { replaceNode } from 'store/design/slice';
import { selectCanConvertToFrame, selectSelectedNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSectionNode } from 'types/design/types';

// utils
import { convertSectionToFrame } from 'utils/canvas/convertFrameSection/convertSectionToFrame';

const convertSectionsToFrames = (dispatch: AppDispatch, sections: TSectionNode[]): void =>
  sections.forEach((node) => dispatch(replaceNode({ id: node.id, node: convertSectionToFrame(node) })));

export const handleConvertSelectionToFrame = (dispatch: AppDispatch): void => {
  const state = store.getState();

  if (selectCanConvertToFrame(state)) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    convertSectionsToFrames(dispatch, selectSelectedNodes(state) as TSectionNode[]);
    dispatch(endHistoryGesture());
  }
};
