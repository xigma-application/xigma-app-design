import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getCollidedNodes } from '../../../../utils/getCollidedNodes';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { isControlPressed } from 'utils/isControlPressed';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { toDraftRect } from '../../../../utils/toDraftRect';

export const continueMarqueeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  marqueeStartRef: RefObject<TPoint | null>,
  marqueeRef: RefObject<TDraftRect | null>,
): void => {
  if (marqueeStartRef.current) {
    const state = store.getState();
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
    const rect = toDraftRect(marqueeStartRef.current, point);
    const collidedNodes = getCollidedNodes(selectOrderedNodes(state), rect, isControlPressed(event));

    marqueeRef.current = rect;
    dispatch(setSelection(collidedNodes.map(({ id }) => id)));
  }
};
