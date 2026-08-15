import { RefObject } from 'react';

// others
import { PATH_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// store
import { selectEditingTextContent, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateTextEditSelection } from 'store/design/slice';

// utils
import { getCurvedHitAtEvent } from '../getCurvedHitAtEvent';
import { getEditingOverlay } from '../getEditingOverlay';
import { getWordRangeAtIndex } from 'utils/canvas/text/getWordRangeAtIndex';
import { setEditableSelectionRange } from '../../../../components/TextEditOverlay/utils/setEditableSelectionRange';

export const handleDoubleClick = (
  canvas: HTMLCanvasElement,
  event: MouseEvent,
  dispatch: AppDispatch,
  anchorIndexRef: RefObject<number | null>,
): void => {
  const overlay = getEditingOverlay();
  const isOnEditingSurface = event.target === canvas || Boolean(overlay && overlay.contains(event.target as Node));
  const hit = isOnEditingSurface ? getCurvedHitAtEvent(canvas, event) : null;
  const viewport = selectViewport(store.getState());
  const tolerance = PATH_TEXT_HIT_TOLERANCE_PX / viewport.zoom;

  if (overlay && hit && hit.distance <= tolerance) {
    event.preventDefault();

    const content = selectEditingTextContent(store.getState());
    const { start, end } = getWordRangeAtIndex(content, hit.index);

    overlay.focus();
    setEditableSelectionRange(overlay, start, end);
    dispatch(updateTextEditSelection({ end, start }));
    anchorIndexRef.current = null;
  }
};
