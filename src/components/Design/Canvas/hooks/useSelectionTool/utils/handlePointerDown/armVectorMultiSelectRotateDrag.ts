import { RefObject } from 'react';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getVectorMultiSelectOrigins } from './getVectorMultiSelectOrigins';

export const armVectorMultiSelectRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorMultiSelectRotateDragRef: RefObject<TVectorMultiSelectRotateDragState | null>,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  bounds: TDraftRect,
  rotation: number,
  point: TPoint,
): void => {
  const pivot: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const { handleOrigins, vertexOrigins } = getVectorMultiSelectOrigins(nodes, vectorEditingNodeIds, selectedVertexIds, selectedHandles);

  vectorMultiSelectRotateDragRef.current = {
    bounds,
    cursorAngle: getRotateCursorAngle(point, bounds, rotation),
    deltaDegrees: 0,
    handleOrigins,
    pivot,
    rotation,
    startAngle: getAngleBetweenPoints(pivot, point),
    vertexOrigins,
  };
  canvas.setPointerCapture(event.pointerId);
};
