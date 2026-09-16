import { RefObject } from 'react';

// types
import { TImageCropMoveDragState } from 'types/design/canvas/types';
import { TImageCrop } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';

export const armImageCropMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageCropMoveDragRef: RefObject<TImageCropMoveDragState | null>,
  nodeId: string,
  paintIndex: number,
  origin: TImageCrop,
  startPoint: TPoint,
): void => {
  imageCropMoveDragRef.current = { nodeId, origin, paintIndex, startPoint };
  canvas.setPointerCapture(event.pointerId);
};
