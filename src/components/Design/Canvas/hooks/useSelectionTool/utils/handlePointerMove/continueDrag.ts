import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TDragState } from '../../types';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
): void => {
  const dragState = dragStateRef.current;

  if (dragState) {
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const deltaX = point.x - dragState.pointerStart.x;
    const deltaY = point.y - dragState.pointerStart.y;

    dragState.hasMoved = true;
    Object.entries(dragState.nodeOrigins).forEach(([id, origin]) => {
      const changes: TSceneNodeChanges =
        'x1' in origin
          ? {
              x1: Math.round(origin.x1 + deltaX),
              x2: Math.round(origin.x2 + deltaX),
              y1: Math.round(origin.y1 + deltaY),
              y2: Math.round(origin.y2 + deltaY),
            }
          : { x: Math.round(origin.x + deltaX), y: Math.round(origin.y + deltaY) };

      dispatch(updateNode({ changes, id }));
    });
  }
};
