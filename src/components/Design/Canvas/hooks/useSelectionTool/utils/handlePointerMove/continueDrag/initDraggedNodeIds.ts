// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

export const initDraggedNodeIds = (canvasRefs: TCanvasRefs, dragState: TDragState): void => {
  if (!canvasRefs.transform.draggedNodeIdsRef.current) {
    canvasRefs.transform.draggedNodeIdsRef.current = new Set(Object.keys(dragState.nodeOrigins));
  }
};
