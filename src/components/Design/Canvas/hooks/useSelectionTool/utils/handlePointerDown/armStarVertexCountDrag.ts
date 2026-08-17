import { RefObject } from 'react';

// types
import { TStarVertexCountDragState } from '../../types';
import { TDraftRect } from 'types/canvas';

export const armStarVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): void => {
  starVertexCountDragRef.current = { bounds, flipX, flipY, nodeId, rotation };
  canvas.setPointerCapture(event.pointerId);
};
