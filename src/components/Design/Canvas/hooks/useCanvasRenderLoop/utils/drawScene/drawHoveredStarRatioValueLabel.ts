// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from './types';

// utils
import { drawStarRatioValueLabel } from './drawStarRatioValueLabel';
import { getStarRatioHandlePosition } from 'utils/canvas/ratio/star/getStarRatioHandlePosition';

export const drawHoveredStarRatioValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  bounds: TDraftRect,
  points: number,
  ratio: number,
  cornerRadius: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  nodeId: string,
): void => {
  const isDragging = Boolean(refs.starRatio.starRatioDragRef.current);
  const isHovered = refs.hover.hoveredStarRatioHandleRef.current === nodeId;

  if (isDragging || isHovered) {
    const handlePosition = getStarRatioHandlePosition(bounds, points, ratio, cornerRadius, flipX, flipY);

    drawStarRatioValueLabel(context, bounds, handlePosition, rotation, ratio);
  }
};
