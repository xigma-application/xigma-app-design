// types
import { TNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { clearDragOriginalFills } from '../../handlePointerMove/continueDrag/dragOriginalFillsCache';

export const clearDraggedNodesOriginalFills = (nodeOrigins: Record<string, TNodeOrigin>): void => {
  Object.keys(nodeOrigins).forEach(clearDragOriginalFills);
};
