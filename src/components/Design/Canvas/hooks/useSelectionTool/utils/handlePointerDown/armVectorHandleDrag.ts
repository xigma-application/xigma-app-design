import { RefObject } from 'react';

// types
import { TVectorHandleDragState } from 'types/design/selectionTool/types';
import { TVectorHandleHit } from '../../../../utils/getVectorHandleAtPoint';

export const armVectorHandleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorHandleDragRef: RefObject<TVectorHandleDragState | null>,
  nodeId: string,
  hit: TVectorHandleHit,
): void => {
  vectorHandleDragRef.current = { end: hit.end, nodeId, segmentId: hit.segmentId, vertexId: hit.vertexId };
  canvas.setPointerCapture(event.pointerId);
};
