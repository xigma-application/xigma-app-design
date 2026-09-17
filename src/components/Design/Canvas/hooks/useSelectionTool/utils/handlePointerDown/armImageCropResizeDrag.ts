import { RefObject } from 'react';

// types
import { TImageCropResizeDragState } from 'types/design/canvas/types';
import { TImageCrop } from 'types/design/paint/types';
import { TResizeHandle } from 'types/canvas';

export const armImageCropResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageCropResizeDragRef: RefObject<TImageCropResizeDragState | null>,
  nodeId: string,
  paintIndex: number,
  origin: TImageCrop,
  handle: TResizeHandle,
  originalFlipX?: boolean,
  originalFlipY?: boolean,
): void => {
  imageCropResizeDragRef.current = { handle, nodeId, origin, originalFlipX, originalFlipY, paintIndex };
  canvas.setPointerCapture(event.pointerId);
};
