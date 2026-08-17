import { RefObject } from 'react';

// types
import { TCornerRadiusDragState } from '../../types';
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';

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
    nodeId,
    pointerStart,
    rotation,
  };
  canvas.setPointerCapture(event.pointerId);
};
