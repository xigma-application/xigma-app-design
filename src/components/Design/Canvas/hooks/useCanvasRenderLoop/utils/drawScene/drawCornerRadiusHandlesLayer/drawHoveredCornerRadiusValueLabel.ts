// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawCornerRadiusValueLabel } from './drawCornerRadiusValueLabel';

export const drawHoveredCornerRadiusValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  isDraggingCornerRadius: boolean,
  bounds: TDraftRect,
  cornerRadius: number,
  rotation: number,
  nodeId: string,
): void => {
  const draggedCorner = isDraggingCornerRadius ? refs.cornerRadius.cornerRadiusDragRef.current?.corner : null;
  const hoveredHandle = refs.hover.hoveredCornerRadiusHandleRef.current;
  const hoveredCorner = hoveredHandle?.nodeId === nodeId ? hoveredHandle.corner : null;
  const corner = draggedCorner ?? hoveredCorner;

  if (corner) {
    drawCornerRadiusValueLabel(context, bounds, cornerRadius, rotation, corner, Boolean(draggedCorner));
  }
};
