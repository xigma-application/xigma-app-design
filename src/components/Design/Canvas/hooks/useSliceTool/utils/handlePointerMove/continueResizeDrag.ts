import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TSliceDraft, TSliceResizeDragState } from '../../types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getResizedSliceBounds } from './getResizedSliceBounds';
import { getUnrotatedQueryPoint } from '../../../../utils/getUnrotatedQueryPoint';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  sliceRef: RefObject<TSliceDraft | null>,
  resizeDragRef: RefObject<TSliceResizeDragState | null>,
): void => {
  if (resizeDragRef.current) {
    const { bounds: origin, handle } = resizeDragRef.current;
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const localPoint = getUnrotatedQueryPoint(point, origin, origin.rotation);
    const localBounds = getResizedSliceBounds(origin, handle, localPoint);
    const originCenter: TPoint = { x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 };
    const localCenter: TPoint = { x: localBounds.x + localBounds.width / 2, y: localBounds.y + localBounds.height / 2 };
    const worldCenter = rotatePoint(localCenter, originCenter, origin.rotation);

    sliceRef.current = {
      height: localBounds.height,
      rotation: origin.rotation,
      width: localBounds.width,
      x: worldCenter.x - localBounds.width / 2,
      y: worldCenter.y - localBounds.height / 2,
    };
  }
};
