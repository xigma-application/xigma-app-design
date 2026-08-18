import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  rotateDragRef: RefObject<TRotateDragState | null>,
): void => {
  const rotateDragState = rotateDragRef.current;

  if (rotateDragState) {
    const { cursorAngle, nodeOrigins, pivot, startAngle } = rotateDragState;
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const deltaDegrees = getAngleBetweenPoints(pivot, point) - startAngle;

    canvas.style.cursor = getRotatedRotateCursorUrl(cursorAngle + deltaDegrees) ?? canvas.style.cursor;

    Object.entries(nodeOrigins).forEach(([id, origin]) => {
      if ('x1' in origin) {
        const { x: x1, y: y1 } = rotatePoint({ x: origin.x1, y: origin.y1 }, pivot, deltaDegrees);
        const { x: x2, y: y2 } = rotatePoint({ x: origin.x2, y: origin.y2 }, pivot, deltaDegrees);

        dispatch(
          updateNode({
            changes: { x1: Math.round(x1), x2: Math.round(x2), y1: Math.round(y1), y2: Math.round(y2) },
            id,
          }),
        );

        return;
      }

      const originCenter = { x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 };
      const newCenter = rotatePoint(originCenter, pivot, deltaDegrees);

      dispatch(
        updateNode({
          changes: {
            rotation: Math.round((origin.rotation + deltaDegrees) * 100) / 100,
            x: Math.round(newCenter.x - origin.width / 2),
            y: Math.round(newCenter.y - origin.height / 2),
          },
          id,
        }),
      );
    });
  }
};
