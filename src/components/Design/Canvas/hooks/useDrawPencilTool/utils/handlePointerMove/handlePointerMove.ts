// others
import { PENCIL_SIMPLIFY_TOLERANCE_PX } from '../../../../constants';

// store
import { selectViewport } from 'store/design/selectors';
import { AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPencilDragRefs } from '../../types';

// utils
import { advancePencilTail } from './advancePencilTail/advancePencilTail';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { updateRawPreview } from './updateRawPreview';
import { updateShiftLockedPreview } from './updateShiftLockedPreview';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  appStore: AppStore,
  refs: TCanvasRefs,
  pencilDragRefs: TPencilDragRefs,
): void => {
  const committed = pencilDragRefs.committedPointsRef.current;
  const tail = pencilDragRefs.tailPointsRef.current;
  const rawPoints = pencilDragRefs.rawPointsRef.current;

  if (committed && tail && rawPoints) {
    const viewport = selectViewport(appStore.getState());
    const currentPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const tolerance = PENCIL_SIMPLIFY_TOLERANCE_PX / viewport.zoom;

    updateRawPreview(event, refs, rawPoints, currentPoint);

    if (event.shiftKey) {
      updateShiftLockedPreview(refs, pencilDragRefs, committed, tail, currentPoint, viewport.zoom, tolerance);
    } else {
      advancePencilTail(refs, pencilDragRefs, committed, tail, currentPoint, viewport.zoom, tolerance);
    }
  }
};
