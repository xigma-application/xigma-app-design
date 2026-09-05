// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

export const updateVectorMultiSelectBoxPosition = (
  canvasRefs: TCanvasRefs,
  dragState: TVectorMultiDragState,
  deltaX: number,
  deltaY: number,
): void => {
  if (dragState.boxOrigin && canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current) {
    canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current = {
      ...canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current,
      bounds: { ...dragState.boxOrigin, x: dragState.boxOrigin.x + deltaX, y: dragState.boxOrigin.y + deltaY },
    };
  }
};
