import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';

// utils
import { armDrag } from './armDrag/armDrag';

export const armGroupBoundsDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dragStateRef: RefObject<TDragState | null>,
  currentSelection: string[],
  point: TPoint,
  canvasRefs: TCanvasRefs,
): void => {
  armDrag(currentSelection, { kind: 'deselect' }, point, dragStateRef, canvasRefs);
  canvas.setPointerCapture(event.pointerId);
};
