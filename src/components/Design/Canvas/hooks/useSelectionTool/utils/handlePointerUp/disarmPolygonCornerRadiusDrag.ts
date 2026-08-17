import { RefObject } from 'react';

// types
import { TPolygonCornerRadiusDragState } from '../../types';

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
