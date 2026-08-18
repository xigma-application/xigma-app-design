import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';

export const armPolygonCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  sides: number,
  flipX: boolean,
  flipY: boolean,
): void => {
  polygonCornerRadiusDragRef.current = { bounds, flipX, flipY, hasMoved: false, nodeId, rotation, sides };
  canvas.setPointerCapture(event.pointerId);
};
