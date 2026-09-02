// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from './types';

// utils
import { drawVertexCountValueLabel } from './drawVertexCountValueLabel';
import { getStarVertexCountHandlePosition } from 'utils/canvas/vertexCount/star/getStarVertexCountHandlePosition';

export const drawHoveredStarVertexCountValueLabel = (
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
  const isDragging = Boolean(refs.vertexCount.starVertexCountDragRef.current);
  const isHovered = refs.hover.hoveredStarVertexCountHandleRef.current === nodeId;

  if (isDragging || isHovered) {
    const handlePosition = getStarVertexCountHandlePosition(bounds, points, ratio, cornerRadius, flipX, flipY);

    drawVertexCountValueLabel(context, bounds, handlePosition, rotation, points);
  }
};
