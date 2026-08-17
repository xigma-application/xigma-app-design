import { RefObject } from 'react';

// types
import { TPolygonCornerRadiusDragState } from '../../types';
import { TDraftRect } from 'types/canvas';

export const armPolygonCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  sides: number,
): void => {
  polygonCornerRadiusDragRef.current = { bounds, hasMoved: false, nodeId, rotation, sides };
  canvas.setPointerCapture(event.pointerId);
};
