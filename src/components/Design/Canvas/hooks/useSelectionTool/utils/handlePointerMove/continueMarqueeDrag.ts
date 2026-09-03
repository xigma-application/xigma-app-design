import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getCollidedNodes } from '../../../../utils/getCollidedNodes';
import { getMarqueeCandidateNodes } from './getMarqueeCandidateNodes';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { isControlPressed } from 'utils/isControlPressed';
import { pruneMarqueeDescendants } from './pruneMarqueeDescendants';
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
    const nodesById = selectNodes(state);
    const candidates = getMarqueeCandidateNodes(selectActivePage(state).rootOrder, nodesById);
    const collidedNodes = pruneMarqueeDescendants(getCollidedNodes(candidates, rect, isControlPressed(event)), nodesById);

    marqueeRef.current = rect;
    dispatch(setSelection(collidedNodes.map(({ id }) => id)));
  }
};
