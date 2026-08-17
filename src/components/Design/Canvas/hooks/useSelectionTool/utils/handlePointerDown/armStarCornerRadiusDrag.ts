import { RefObject } from 'react';

// types
import { TStarCornerRadiusDragState } from '../../types';
import { TDraftRect } from 'types/canvas';

export const armStarCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  points: number,
  ratio: number,
): void => {
  starCornerRadiusDragRef.current = { bounds, hasMoved: false, nodeId, points, ratio, rotation };
  canvas.setPointerCapture(event.pointerId);
};
