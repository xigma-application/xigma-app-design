import { RefObject } from 'react';

// types
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';
import { TCornerRadiusDragState } from 'types/design/canvas/types';

export const armCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>,
  bounds: TDraftRect,
  candidates: TCornerRadiusHandle[],
  nodeId: string,
  rotation: number,
  pointerStart: TPoint,
): void => {
  cornerRadiusDragRef.current = {
    bounds,
    candidates,
    corner: candidates.length === 1 ? candidates[0] : null,
    hasMoved: false,
    nodeId,
    pointerStart,
    rotation,
  };
  canvas.setPointerCapture(event.pointerId);
};
