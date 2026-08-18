import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';

type TVertexCountDragState = {
  bounds: TDraftRect;
  flipX: boolean;
  flipY: boolean;
  nodeId: string;
  rotation: number;
};

export const armVertexCountDrag = <T extends TVertexCountDragState>(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dragRef: RefObject<T | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): void => {
  dragRef.current = { bounds, flipX, flipY, nodeId, rotation } as T;
  canvas.setPointerCapture(event.pointerId);
};
