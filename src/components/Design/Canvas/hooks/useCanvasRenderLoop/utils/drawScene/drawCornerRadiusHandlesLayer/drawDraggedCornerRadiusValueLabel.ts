// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawCornerRadiusValueLabel } from './drawCornerRadiusValueLabel';

export const drawDraggedCornerRadiusValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  isDraggingCornerRadius: boolean,
  bounds: TDraftRect,
  cornerRadius: number,
  rotation: number,
): void => {
  const draggedCorner = isDraggingCornerRadius ? refs.cornerRadius.cornerRadiusDragRef.current?.corner : null;

  if (draggedCorner) {
    drawCornerRadiusValueLabel(context, bounds, cornerRadius, rotation, draggedCorner);
  }
};
