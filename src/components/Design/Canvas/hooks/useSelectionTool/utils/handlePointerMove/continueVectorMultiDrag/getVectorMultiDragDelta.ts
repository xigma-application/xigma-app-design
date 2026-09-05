// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// types
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

// utils
import { getAllVectorVertexPositions } from 'components/Design/Canvas/utils/getAllVectorVertexPositions';
import { getGroupAlignmentGuide, type TAlignmentGuide } from 'components/Design/Canvas/utils/getGroupAlignmentGuide';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export type TVectorMultiDragDelta = { deltaX: number; deltaY: number; guide: TAlignmentGuide | null };

export const getVectorMultiDragDelta = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: TViewport,
  nodes: Record<string, TSceneNode>,
  dragState: TVectorMultiDragState,
): TVectorMultiDragDelta => {
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);
  const rawDeltaX = point.x - dragState.pointerStart.x;
  const rawDeltaY = point.y - dragState.pointerStart.y;
  const draggedVertexIds = Object.keys(dragState.vertexOrigins);
  const draggedPoints = draggedVertexIds.map((id) => ({
    x: dragState.vertexOrigins[id].x + rawDeltaX,
    y: dragState.vertexOrigins[id].y + rawDeltaY,
  }));
  const candidates = getAllVectorVertexPositions(nodes, draggedVertexIds);
  const alignmentTolerance = ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom;
  const { deltaCorrection, guide } = getGroupAlignmentGuide(draggedPoints, candidates, alignmentTolerance);

  return { deltaX: rawDeltaX + deltaCorrection.x, deltaY: rawDeltaY + deltaCorrection.y, guide };
};
