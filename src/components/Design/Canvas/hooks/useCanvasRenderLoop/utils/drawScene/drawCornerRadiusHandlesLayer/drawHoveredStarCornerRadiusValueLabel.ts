// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawStarCornerRadiusValueLabel } from './drawStarCornerRadiusValueLabel';

export const drawHoveredStarCornerRadiusValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  isDraggingCornerRadius: boolean,
  bounds: TDraftRect,
  points: number,
  ratio: number,
  cornerRadius: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  nodeId: string,
): void => {
  const isDraggingStarHandle = isDraggingCornerRadius && Boolean(refs.cornerRadius.starCornerRadiusDragRef.current);
  const isHovered = refs.hover.hoveredStarCornerRadiusHandleRef.current === nodeId;

  if (isDraggingStarHandle || isHovered) {
    drawStarCornerRadiusValueLabel(context, bounds, points, ratio, cornerRadius, rotation, flipX, flipY, isDraggingStarHandle);
  }
};
