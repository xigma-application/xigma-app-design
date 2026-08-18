import { RefObject } from 'react';

// types
import { TEllipseArcRotateDragState } from '../../types';
import { TDraftRect } from 'types/canvas';

export const armEllipseArcRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): void => {
  ellipseArcRotateDragRef.current = { bounds, draggedHandlePosition: null, flipX, flipY, nodeId, rotation };
  canvas.setPointerCapture(event.pointerId);
};
