import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';
import { updateTextEditSelection } from 'store/design/slice';

// utils
import { continueEditingPathOffsetDrag } from './continueEditingPathOffsetDrag';
import { getCurvedHitAtEvent } from '../getCurvedHitAtEvent';
import { getEditingOverlay } from '../../../../utils/getEditingOverlay';
import { setEditableSelectionRange } from '../../../../TextEditOverlay/utils/setEditableSelectionRange';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  anchorIndexRef: RefObject<number | null>,
  isDraggingOffsetRef: RefObject<boolean>,
): void => {
  if (isDraggingOffsetRef.current && event.buttons !== 0) {
    event.preventDefault();
    continueEditingPathOffsetDrag(canvas, event, dispatch);
    return;
  }

  const overlay = getEditingOverlay();
  const anchor = anchorIndexRef.current;

  if (overlay && anchor !== null && event.buttons !== 0) {
    const hit = getCurvedHitAtEvent(canvas, event);

    if (hit) {
      event.preventDefault();

      const start = Math.min(anchor, hit.index);
      const end = Math.max(anchor, hit.index);

      setEditableSelectionRange(overlay, start, end);
      dispatch(updateTextEditSelection({ end, start }));
    }
  }
};
