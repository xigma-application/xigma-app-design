import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';

// utils
import { applyDragPan } from 'components/Design/Canvas/hooks/useCanvasDragPan/utils/applyDragPan';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  lastPointRef: RefObject<TPoint | null>,
): void => {
  if (lastPointRef.current) {
    const point = getPointerPosition(canvas, event);
    const viewport = selectViewport(store.getState());

    dispatch(setViewport(applyDragPan(viewport, point.x - lastPointRef.current.x, point.y - lastPointRef.current.y)));
    lastPointRef.current = point;
  }
};
