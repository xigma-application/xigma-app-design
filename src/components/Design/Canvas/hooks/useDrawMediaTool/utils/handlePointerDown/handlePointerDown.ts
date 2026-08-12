import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TArmedMedia } from '../loadArmedMedia';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  armedRef: RefObject<TArmedMedia | null>,
  startRef: RefObject<TPoint | null>,
): void => {
  if (event.button === MouseButton.primary && armedRef.current) {
    dispatch(setSelection([]));
    startRef.current = screenToWorld(getPointerPosition(canvas, event), selectViewport(appStore.getState()));
    canvas.setPointerCapture(event.pointerId);
  }
};
