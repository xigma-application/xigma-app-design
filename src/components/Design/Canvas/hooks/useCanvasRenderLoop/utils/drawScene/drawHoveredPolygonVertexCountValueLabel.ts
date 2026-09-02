// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from './types';

// utils
import { drawVertexCountValueLabel } from './drawVertexCountValueLabel';
import { getPolygonVertexCountHandlePosition } from 'utils/canvas/vertexCount/polygon/getPolygonVertexCountHandlePosition';

export const drawHoveredPolygonVertexCountValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  bounds: TDraftRect,
  sides: number,
  cornerRadius: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  nodeId: string,
): void => {
  const isDragging = Boolean(refs.vertexCount.polygonVertexCountDragRef.current);
  const isHovered = refs.hover.hoveredPolygonVertexCountHandleRef.current === nodeId;

  if (isDragging || isHovered) {
    const handlePosition = getPolygonVertexCountHandlePosition(bounds, sides, cornerRadius, flipX, flipY);

    drawVertexCountValueLabel(context, bounds, handlePosition, rotation, sides);
  }
};
