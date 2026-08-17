import { RefObject } from 'react';

// types
import { TPolygonVertexCountDragState } from '../../types';
import { TDraftRect } from 'types/canvas';

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
