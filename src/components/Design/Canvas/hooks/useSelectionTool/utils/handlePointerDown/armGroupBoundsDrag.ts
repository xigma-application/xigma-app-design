import { RefObject } from 'react';

// types
import { TDragState } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { armDrag } from './armDrag';

export const armGroupBoundsDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dragStateRef: RefObject<TDragState | null>,
  currentSelection: string[],
  point: TPoint,
): void => {
  armDrag(currentSelection, { kind: 'deselect' }, point, dragStateRef);
  canvas.setPointerCapture(event.pointerId);
};
