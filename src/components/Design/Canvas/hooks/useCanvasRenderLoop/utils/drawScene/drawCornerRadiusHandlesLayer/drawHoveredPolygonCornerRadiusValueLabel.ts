// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawPolygonCornerRadiusValueLabel } from './drawPolygonCornerRadiusValueLabel';

export const drawHoveredPolygonCornerRadiusValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  isDraggingCornerRadius: boolean,
  bounds: TDraftRect,
  sides: number,
  cornerRadius: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  nodeId: string,
): void => {
  const isDraggingPolygonHandle = isDraggingCornerRadius && Boolean(refs.cornerRadius.polygonCornerRadiusDragRef.current);
  const isHovered = refs.hover.hoveredPolygonCornerRadiusHandleRef.current === nodeId;

  if (isDraggingPolygonHandle || isHovered) {
    drawPolygonCornerRadiusValueLabel(context, bounds, sides, cornerRadius, rotation, flipX, flipY, isDraggingPolygonHandle);
  }
};
