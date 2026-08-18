import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TPolygonVertexCountDragState } from 'types/design/selectionTool/types';

export const armPolygonVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): void => {
  polygonVertexCountDragRef.current = { bounds, flipX, flipY, nodeId, rotation };
  canvas.setPointerCapture(event.pointerId);
};
