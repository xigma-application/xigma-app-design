import { RefObject } from 'react';

// types
import { TEllipseArcDragState } from '../../types';
import { TDraftRect } from 'types/canvas';

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
