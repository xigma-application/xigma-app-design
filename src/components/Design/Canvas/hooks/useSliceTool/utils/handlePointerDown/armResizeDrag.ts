import { RefObject } from 'react';

// types
import { TResizeHandle } from 'types/canvas';
import { TSliceResizeDragState } from '../../types';
import { TSliceDraft } from 'types/design/canvas/types';

export const armResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TSliceResizeDragState | null>,
  bounds: TSliceDraft,
  handle: TResizeHandle,
): void => {
  resizeDragRef.current = { bounds, handle };
  canvas.setPointerCapture(event.pointerId);
};
