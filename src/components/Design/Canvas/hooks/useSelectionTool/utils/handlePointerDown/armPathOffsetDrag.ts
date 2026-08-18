import { RefObject } from 'react';
import { TPathOffsetDragState } from 'types/design/selectionTool/types';

// types

export const armPathOffsetDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>,
  nodeId: string,
  setClassName: (className: string | null) => void,
): void => {
  pathOffsetDragRef.current = { nodeId };
  canvas.setPointerCapture(event.pointerId);
  setClassName('pressing');
};
