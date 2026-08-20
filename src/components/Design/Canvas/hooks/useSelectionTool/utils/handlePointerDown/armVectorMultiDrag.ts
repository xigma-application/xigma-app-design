import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorMultiDragState, TVectorPendingClickAction } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectOrigins } from './getVectorMultiSelectOrigins';

export const armVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>,
  node: TVectorNode,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  point: TPoint,
  pendingClickAction: TVectorPendingClickAction | null = null,
  box: TVectorMultiSelectBox | null = null,
): void => {
  const { handleOrigins, vertexOrigins } = getVectorMultiSelectOrigins(node, selectedVertexIds, selectedHandles);

  vectorMultiDragRef.current = {
    boxOrigin: box?.bounds ?? null,
    handleOrigins,
    hasMoved: false,
    nodeId: node.id,
    pendingClickAction,
    pointerStart: point,
    vertexOrigins,
  };
  canvas.setPointerCapture(event.pointerId);
};
