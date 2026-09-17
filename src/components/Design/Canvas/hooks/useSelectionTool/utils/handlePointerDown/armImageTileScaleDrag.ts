import { RefObject } from 'react';

// types
import { TImageTileScaleDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const armImageTileScaleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageTileScaleDragRef: RefObject<TImageTileScaleDragState | null>,
  nodeId: string,
  paintIndex: number,
  anchor: TPoint,
  startDistance: number,
  startScale: number,
): void => {
  imageTileScaleDragRef.current = { anchor, nodeId, paintIndex, startDistance, startScale };
  canvas.setPointerCapture(event.pointerId);
};
