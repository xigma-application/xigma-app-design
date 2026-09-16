import { RefObject } from 'react';

// types
import { TImageCropRotateDragState } from 'types/design/canvas/types';
import { TImageCrop } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';

export const armImageCropRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageCropRotateDragRef: RefObject<TImageCropRotateDragState | null>,
  nodeId: string,
  paintIndex: number,
  origin: TImageCrop,
  point: TPoint,
): void => {
  const pivot: TPoint = { x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 };

  imageCropRotateDragRef.current = { nodeId, origin, paintIndex, pivot, startAngle: getAngleBetweenPoints(pivot, point) };
  canvas.setPointerCapture(event.pointerId);
};
