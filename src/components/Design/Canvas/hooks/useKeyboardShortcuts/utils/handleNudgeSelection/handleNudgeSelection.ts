// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, RootState, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { collectNudgeSubtreeNodes } from '../collectNudgeSubtreeNodes';
import { getFlowReorderFrame } from './getFlowReorderFrame';
import { getGridSlotMoveFrame } from './getGridSlotMoveFrame';
import { handleFlowReorderMove } from './handleFlowReorderMove/handleFlowReorderMove';
import { handleGridSlotMove } from './handleGridSlotMove';
import { handleNudgeVectorEdit } from '../handleNudgeVectorEdit';
import { isNudgeableNode } from '../isNudgeableNode';
import { translateNodes } from 'components/Design/Canvas/utils/translateNodes';
import { updateNudgeDistanceGuide } from '../updateNudgeDistanceGuide';

const getSelectedNodes = (state: RootState, nodes: Record<string, TSceneNode>): TSceneNode[] =>
  selectSelectedIds(state)
    .map((id) => nodes[id])
    .filter((node): node is TSceneNode => node !== undefined);

export const handleNudgeSelection = (dispatch: AppDispatch, refs: TCanvasRefs, deltaX: number, deltaY: number, altKey = false): void => {
  const state = store.getState();
  const { vectorEditingNodeIds } = state.design;

  if (vectorEditingNodeIds.length > 0) {
    handleNudgeVectorEdit(dispatch, refs, deltaX, deltaY, altKey);
  } else {
    const nodes = selectNodes(state);
    const selectedNodes = getSelectedNodes(state, nodes);
    const gridFrame = getGridSlotMoveFrame(selectedNodes, nodes);
    const flowFrame = gridFrame ? null : getFlowReorderFrame(selectedNodes, nodes);

    if (gridFrame) {
      handleGridSlotMove(dispatch, refs, gridFrame, selectedNodes, nodes, deltaX, deltaY);
    } else if (flowFrame) {
      handleFlowReorderMove(dispatch, refs, flowFrame, selectedNodes, nodes, deltaX, deltaY);
    } else {
      const nodesToMove = selectedNodes.filter((node) => isNudgeableNode(node, nodes));

      if (nodesToMove.length > 0) {
        const subtreeNodes = collectNudgeSubtreeNodes(nodesToMove, nodes);

        dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
        translateNodes(dispatch, subtreeNodes, deltaX, deltaY);
        dispatch(endHistoryGesture());
        updateNudgeDistanceGuide(store.getState(), refs, altKey);
      }
    }
  }
};
