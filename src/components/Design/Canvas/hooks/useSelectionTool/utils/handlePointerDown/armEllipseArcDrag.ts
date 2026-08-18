import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TEllipseArcDragState } from 'types/design/canvas/types';

export const armEllipseArcDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): void => {
  ellipseArcDragRef.current = { bounds, draggedHandlePosition: null, flipX, flipY, nodeId, rotation };
  canvas.setPointerCapture(event.pointerId);
};
