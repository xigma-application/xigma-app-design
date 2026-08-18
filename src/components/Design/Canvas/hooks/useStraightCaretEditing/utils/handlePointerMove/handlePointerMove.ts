import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';
import { updateTextEditSelection } from 'store/design/slice';

// utils
import { getEditingOverlay } from '../../../../utils/getEditingOverlay';
import { getStraightHitAtEvent } from '../getStraightHitAtEvent';
import { setEditableSelectionRange } from '../../../../components/TextEditOverlay/utils/setEditableSelectionRange';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  anchorIndexRef: RefObject<number | null>,
): void => {
  const overlay = getEditingOverlay();
  const anchor = anchorIndexRef.current;

  if (overlay && anchor !== null && event.buttons !== 0) {
    const hit = getStraightHitAtEvent(canvas, event);

    if (hit) {
      event.preventDefault();

      const start = Math.min(anchor, hit.index);
      const end = Math.max(anchor, hit.index);

      setEditableSelectionRange(overlay, start, end);
      dispatch(updateTextEditSelection({ end, start }));
    }
  }
};
