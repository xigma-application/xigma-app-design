import { RefObject } from 'react';

// others
import { MIN_SHAPE_SIZE } from '../../../../constants';

// store
import { setActiveTool } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TSliceDraft, TSliceDrawDragState } from '../../types';

// utils
import { DEFAULT_CURSOR } from 'utils/canvas/defaultCursor';

export const disarmDrawDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  sliceRef: RefObject<TSliceDraft | null>,
  drawDragRef: RefObject<TSliceDrawDragState | null>,
): void => {
  if (drawDragRef.current) {
    const slice = sliceRef.current;

    if (slice && slice.width >= MIN_SHAPE_SIZE && slice.height >= MIN_SHAPE_SIZE) {
      canvas.style.cursor = DEFAULT_CURSOR;
    } else {
      sliceRef.current = null;
      dispatch(setActiveTool(ToolName.default));
    }

    drawDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
