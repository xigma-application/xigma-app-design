import { RefObject } from 'react';

// types
import { TEllipseArcRatioDragState } from '../../types';
import { TDraftRect } from 'types/canvas';

export const armEllipseArcRatioDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): void => {
  ellipseArcRatioDragRef.current = { bounds, draggedHandlePosition: null, flipX, flipY, nodeId, rotation };
  canvas.setPointerCapture(event.pointerId);
};
