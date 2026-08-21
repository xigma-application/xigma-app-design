import { RefObject } from 'react';

// others
import { LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX, PATH_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// store
import { selectEditingTextBox, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateTextEditSelection } from 'store/design/slice';

// utils
import { getCurvedHitAtEvent } from '../getCurvedHitAtEvent';
import { getEditingOverlay } from '../../../../utils/getEditingOverlay';
import { getPathTextHandlePoint } from '../../../../utils/getPathTextHandlePoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { setEditableSelectionRange } from '../../../../TextEditOverlay/utils/setEditableSelectionRange';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  anchorIndexRef: RefObject<number | null>,
  isDraggingOffsetRef: RefObject<boolean>,
  setClassName: (className: string | null) => void,
): void => {
  const overlay = getEditingOverlay();
  const isOnEditingSurface = event.target === canvas || Boolean(overlay && overlay.contains(event.target as Node));
  const state = store.getState();
  const viewport = selectViewport(state);
  const box = selectEditingTextBox(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);
  const handlePoint = isOnEditingSurface && box ? getPathTextHandlePoint(box) : null;
  const radius = LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX / viewport.zoom;
  const isOnOffsetHandle = Boolean(handlePoint && Math.hypot(point.x - handlePoint.x, point.y - handlePoint.y) <= radius);

  if (isOnOffsetHandle) {
    event.preventDefault();
    isDraggingOffsetRef.current = true;
    anchorIndexRef.current = null;
    setClassName('pressing');
    return;
  }

  const hit = isOnEditingSurface ? getCurvedHitAtEvent(canvas, event) : null;
  const tolerance = PATH_TEXT_HIT_TOLERANCE_PX / viewport.zoom;

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
