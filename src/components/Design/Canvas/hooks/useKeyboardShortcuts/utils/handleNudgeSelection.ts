// components
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';

// store
import { updateNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { collectNudgeSubtreeNodes } from './collectNudgeSubtreeNodes';
import { handleNudgeVectorEdit } from './handleNudgeVectorEdit';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isNudgeableNode } from './isNudgeableNode';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';
import { updateNudgeDistanceGuide } from './updateNudgeDistanceGuide';

const nudgeSubtreeNodes = (dispatch: AppDispatch, subtreeNodes: TSceneNode[], deltaX: number, deltaY: number): void => {
  subtreeNodes.forEach((node) => {
    const geometryChanges = getGeometryDeltaChanges(node, deltaX, deltaY);
    const fills = isAppearanceNode(node) ? translateFillsCrop(node.fills, deltaX, deltaY) : undefined;

    dispatch(updateNode({ changes: fills ? { ...geometryChanges, fills } : geometryChanges, id: node.id }));
  });
};

export const handleNudgeSelection = (dispatch: AppDispatch, refs: TCanvasRefs, deltaX: number, deltaY: number, altKey = false): void => {
  const state = store.getState();
  const { vectorEditingNodeIds } = state.design;

  if (vectorEditingNodeIds.length > 0) {
    handleNudgeVectorEdit(dispatch, refs, deltaX, deltaY, altKey);
  } else {
    const selectedIds = selectSelectedIds(state);
    const nodes = selectNodes(state);
    const nodesToMove = selectedIds
      .map((id) => nodes[id])
      .filter((node): node is TSceneNode => node !== undefined && isNudgeableNode(node, nodes));

    if (nodesToMove.length > 0) {
      const subtreeNodes = collectNudgeSubtreeNodes(nodesToMove, nodes);

      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      nudgeSubtreeNodes(dispatch, subtreeNodes, deltaX, deltaY);
      dispatch(endHistoryGesture());
      updateNudgeDistanceGuide(store.getState(), refs, altKey);
    }
  }
};
