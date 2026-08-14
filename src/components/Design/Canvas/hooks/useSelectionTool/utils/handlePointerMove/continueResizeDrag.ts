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
import { getResizeAxisAnchors } from '../../../../utils/getResizeAxisAnchors';
import { screenToWorld } from '../../../../utils/screenToWorld';

const getSignedScale = (newStart: number, newSize: number, originStart: number, originSize: number, anchor: number | null): number => {
  const originCenter = originStart + originSize / 2;

  switch (true) {
    case anchor === null:
    case originCenter === anchor:
      return 1;
    default: {
      const newCenter = newStart + newSize / 2;
      return (newCenter - anchor!) / (originCenter - anchor!);
    }
  }
};

const transformCoord = (coord: number, anchor: number | null, scale: number): number =>
  anchor === null ? coord : anchor + (coord - anchor) * scale;

const getRotatedAxisScales = (scaleX: number, scaleY: number, rotation: number): { x: number; y: number } => {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: Math.sqrt((scaleX * cos) ** 2 + (scaleY * sin) ** 2),
    y: Math.sqrt((scaleX * sin) ** 2 + (scaleY * cos) ** 2),
  };
};

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
    const cornerAnchor = getResizeAnchorPoint(handle, bounds);
    const newBounds =
      cornerAnchor && event.shiftKey
        ? getAspectRatioLockedRect(cornerAnchor, point, aspectRatio)
        : computeResizedRect(handle, bounds, point);
    const anchors = getResizeAxisAnchors(handle, bounds);
    const scaleX = getSignedScale(newBounds.x, newBounds.width, bounds.x, bounds.width, anchors.x);
    const scaleY = getSignedScale(newBounds.y, newBounds.height, bounds.y, bounds.height, anchors.y);

    Object.entries(nodeOrigins).forEach(([id, origin]) => {
      if ('x1' in origin) {
        dispatch(
          updateNode({
            changes: {
              x1: transformCoord(origin.x1, anchors.x, scaleX),
              x2: transformCoord(origin.x2, anchors.x, scaleX),
              y1: transformCoord(origin.y1, anchors.y, scaleY),
              y2: transformCoord(origin.y2, anchors.y, scaleY),
            },
            id,
          }),
        );

        return;
      }

      const newCenterX = transformCoord(origin.x + origin.width / 2, anchors.x, scaleX);
      const newCenterY = transformCoord(origin.y + origin.height / 2, anchors.y, scaleY);
      const axisScale = getRotatedAxisScales(scaleX, scaleY, origin.rotation);
      const height = origin.height * axisScale.y;
      const width = origin.width * axisScale.x;
      const x = newCenterX - width / 2;
      const y = newCenterY - height / 2;
      const changes: TSceneNodeChanges = origin.flip
        ? { flipX: origin.flip.x !== scaleX < 0, flipY: origin.flip.y !== scaleY < 0, height, width, x, y }
        : { height, width, x, y };

      dispatch(updateNode({ changes, id }));
    });
  }
};
