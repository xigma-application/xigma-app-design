import { RefObject } from 'react';

// others
import { STRAIGHT_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateTextEditSelection } from 'store/design/slice';

// utils
import { getEditingOverlay } from '../getEditingOverlay';
import { getStraightHitAtEvent } from '../getStraightHitAtEvent';
import { setEditableSelectionRange } from '../../../../components/TextEditOverlay/utils/setEditableSelectionRange';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  anchorIndexRef: RefObject<number | null>,
): void => {
  const overlay = getEditingOverlay();
  const isOnEditingSurface = event.target === canvas || Boolean(overlay && overlay.contains(event.target as Node));
  const hit = isOnEditingSurface ? getStraightHitAtEvent(canvas, event) : null;
  const viewport = selectViewport(store.getState());
  const tolerance = STRAIGHT_TEXT_HIT_TOLERANCE_PX / viewport.zoom;

  if (overlay && hit && hit.distance <= tolerance) {
    event.preventDefault();
    overlay.focus();
    setEditableSelectionRange(overlay, hit.index, hit.index);
    dispatch(updateTextEditSelection({ end: hit.index, start: hit.index }));
    anchorIndexRef.current = hit.index;
  } else {
    anchorIndexRef.current = null;
  }
};
