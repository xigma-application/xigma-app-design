// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { clearResizeOriginalFills } from '../../../useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeOriginalFillsCache';
import { getResizeNodeOrigin } from '../../../useSelectionTool/utils/handlePointerDown/armResizeDrag/getResizeNodeOrigin';
import { resizeNode } from '../../../useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeNode';

const normalizeFlippedLeafRotation = (dispatch: AppDispatch, leaf: TSceneNode): void => {
  if (leaf.type !== NodeType.line && leaf.rotation !== 0) {
    dispatch(updateNode({ changes: { rotation: (360 - (leaf.rotation % 360)) % 360 }, id: leaf.id }));
  }
};

export const flipLeafNode = (
  dispatch: AppDispatch,
  leaf: TSceneNode,
  anchors: TPoint,
  scaleX: number,
  scaleY: number,
  isSingleBoxOrigin: boolean,
): void => {
  const origin = getResizeNodeOrigin(leaf);

  clearResizeOriginalFills(leaf.id);
  resizeNode(leaf.id, origin, dispatch, anchors, scaleX, scaleY, isSingleBoxOrigin, null);
  clearResizeOriginalFills(leaf.id);
  normalizeFlippedLeafRotation(dispatch, leaf);
};
