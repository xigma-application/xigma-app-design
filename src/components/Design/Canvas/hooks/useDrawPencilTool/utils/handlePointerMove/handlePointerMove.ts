import { RefObject } from 'react';

// others
import { PENCIL_SIMPLIFY_TOLERANCE_PX } from '../../../../constants';

// store
import { selectViewport } from 'store/design/selectors';
import { AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPencilAxis } from './getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { advancePencilTail } from './advancePencilTail';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { updateRawPreview } from './updateRawPreview';
import { updateShiftLockedPreview } from './updateShiftLockedPreview';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  appStore: AppStore,
  refs: TCanvasRefs,
  committedPointsRef: RefObject<TPoint[] | null>,
  tailPointsRef: RefObject<TPoint[] | null>,
  axisLockRef: RefObject<TPencilAxis | null>,
  shiftAnchorRef: RefObject<TPoint | null>,
  rawPointsRef: RefObject<TPoint[] | null>,
): void => {
  const committed = committedPointsRef.current;
  const tail = tailPointsRef.current;
  const rawPoints = rawPointsRef.current;

  if (committed && tail && rawPoints) {
    const viewport = selectViewport(appStore.getState());
    const currentPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const tolerance = PENCIL_SIMPLIFY_TOLERANCE_PX / viewport.zoom;

    updateRawPreview(event, refs, rawPoints, currentPoint);

    if (event.shiftKey) {
      updateShiftLockedPreview(refs, committed, tail, axisLockRef, shiftAnchorRef, currentPoint, viewport.zoom, tolerance);
    } else {
      advancePencilTail(
        refs,
        committedPointsRef,
        tailPointsRef,
        axisLockRef,
        shiftAnchorRef,
        committed,
        tail,
        currentPoint,
        viewport.zoom,
        tolerance,
      );
    }
  }
};
