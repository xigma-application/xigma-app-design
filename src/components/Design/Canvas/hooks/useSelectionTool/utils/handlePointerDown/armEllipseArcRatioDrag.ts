import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TEllipseArcRatioDragState } from 'types/design/canvas/types';

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
