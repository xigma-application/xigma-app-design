import { RefObject } from 'react';
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';

// types

export const disarmPolygonCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
): void => {
  if (polygonCornerRadiusDragRef.current) {
    polygonCornerRadiusDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
