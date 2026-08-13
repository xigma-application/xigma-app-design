import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TResizeDragState } from '../../types';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { computeResizedRect } from '../../../../utils/computeResizedRect';
import { getAspectRatioLockedRect } from 'utils/math/getAspectRatioLockedRect';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getResizeAnchorPoint } from '../../../../utils/getResizeAnchorPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  resizeDragRef: RefObject<TResizeDragState | null>,
): void => {
  const resizeDragState = resizeDragRef.current;

  if (resizeDragState) {
    const { aspectRatio, bounds, handle, nodeOrigins } = resizeDragState;
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const anchor = getResizeAnchorPoint(handle, bounds);
    const newBounds =
      anchor && event.shiftKey ? getAspectRatioLockedRect(anchor, point, aspectRatio) : computeResizedRect(handle, bounds, point);
    const scaleX = bounds.width > 0 ? newBounds.width / bounds.width : 1;
    const scaleY = bounds.height > 0 ? newBounds.height / bounds.height : 1;

    Object.entries(nodeOrigins).forEach(([id, origin]) => {
      const changes: TSceneNodeChanges =
        'x1' in origin
          ? {
              x1: newBounds.x + (origin.x1 - bounds.x) * scaleX,
              x2: newBounds.x + (origin.x2 - bounds.x) * scaleX,
              y1: newBounds.y + (origin.y1 - bounds.y) * scaleY,
              y2: newBounds.y + (origin.y2 - bounds.y) * scaleY,
            }
          : {
              height: origin.height * scaleY,
              width: origin.width * scaleX,
              x: newBounds.x + (origin.x - bounds.x) * scaleX,
              y: newBounds.y + (origin.y - bounds.y) * scaleY,
            };

      dispatch(updateNode({ changes, id }));
    });
  }
};
