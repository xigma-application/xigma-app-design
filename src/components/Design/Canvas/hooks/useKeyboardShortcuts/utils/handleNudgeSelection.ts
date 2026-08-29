// components
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';

// store
import { updateNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectOrderedNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const handleNudgeSelection = (dispatch: AppDispatch, refs: TCanvasRefs, deltaX: number, deltaY: number): void => {
  const state = store.getState();
  const selectedIds = selectSelectedIds(state);
  const { vectorEditingNodeIds } = state.design;

  if (selectedIds.length > 0 && vectorEditingNodeIds.length === 0) {
    const nodesToMove = selectOrderedNodes(state).filter((node) => selectedIds.includes(node.id));

    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    nodesToMove.forEach((node) => dispatch(updateNode({ changes: getGeometryDeltaChanges(node, deltaX, deltaY), id: node.id })));
    dispatch(endHistoryGesture());
  }
};
