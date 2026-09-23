// components
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';

// store
import { updateNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, RootState, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getCropPaintChanges } from 'components/Design/Canvas/utils/getCropPaintChanges';
import { collectNudgeSubtreeNodes } from '../collectNudgeSubtreeNodes';
import { getFlowReorderFrame } from './getFlowReorderFrame';
import { getGridSlotMoveFrame } from './getGridSlotMoveFrame';
import { handleFlowReorderMove } from './handleFlowReorderMove/handleFlowReorderMove';
import { handleGridSlotMove } from './handleGridSlotMove';
import { handleNudgeVectorEdit } from '../handleNudgeVectorEdit';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isNudgeableNode } from '../isNudgeableNode';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';
import { updateNudgeDistanceGuide } from '../updateNudgeDistanceGuide';

const getSelectedNodes = (state: RootState, nodes: Record<string, TSceneNode>): TSceneNode[] =>
  selectSelectedIds(state)
    .map((id) => nodes[id])
    .filter((node): node is TSceneNode => node !== undefined);

const nudgeSubtreeNodes = (dispatch: AppDispatch, subtreeNodes: TSceneNode[], deltaX: number, deltaY: number): void => {
  subtreeNodes.forEach((node) => {
    const geometryChanges = getGeometryDeltaChanges(node, deltaX, deltaY);
    const cropChanges = isAppearanceNode(node) ? getCropPaintChanges(node, (paints) => translateFillsCrop(paints, deltaX, deltaY)) : {};

    dispatch(updateNode({ changes: { ...geometryChanges, ...cropChanges }, id: node.id }));
  });
};

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
        nudgeSubtreeNodes(dispatch, subtreeNodes, deltaX, deltaY);
        dispatch(endHistoryGesture());
        updateNudgeDistanceGuide(store.getState(), refs, altKey);
      }
    }
  }
};
