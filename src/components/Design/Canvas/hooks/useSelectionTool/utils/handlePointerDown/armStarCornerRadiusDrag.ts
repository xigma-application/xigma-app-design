import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TStarCornerRadiusDragState } from 'types/design/canvas/types';

export const armStarCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  points: number,
  ratio: number,
  flipX: boolean,
  flipY: boolean,
): void => {
  starCornerRadiusDragRef.current = { bounds, flipX, flipY, hasMoved: false, nodeId, points, ratio, rotation };
  canvas.setPointerCapture(event.pointerId);
};
