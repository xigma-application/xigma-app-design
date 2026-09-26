// store
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { clearResizeOriginalFills } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeOriginalFillsCache';
import { getResizeNodeOrigin } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerDown/armResizeDrag/getResizeNodeOrigin';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { resizeNode } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueResizeDrag/resizeNode/resizeNode';

export const resizeVectorToDimensions = (dispatch: AppDispatch, node: TVectorNode, dimensions: { height: number; width: number }): void => {
  const bounds = getVectorNodeBounds(node);
  const scaleX = bounds.width > 0 ? dimensions.width / bounds.width : 1;
  const scaleY = bounds.height > 0 ? dimensions.height / bounds.height : 1;

  resizeNode(node.id, getResizeNodeOrigin(node), dispatch, { x: bounds.x, y: bounds.y }, scaleX, scaleY, false, null);
  clearResizeOriginalFills(node.id);
};
