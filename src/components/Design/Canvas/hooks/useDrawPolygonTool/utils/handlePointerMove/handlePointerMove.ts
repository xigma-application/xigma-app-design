import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getPointAlignmentSnap } from 'components/Design/Canvas/utils/getPointAlignmentSnap';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getShapeDraftRect } from 'components/Design/Canvas/utils/getShapeDraftRect';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
): void => {
  const { alignmentGuideRef, aspectRatioLockGuideRef } = canvasRefs.transform;

  if (startRef.current && nodeIdRef.current) {
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
    const rect = getShapeDraftRect(startRef.current, snap.point, event.shiftKey);

    dispatch(updateNode({ changes: rect, id: nodeIdRef.current }));
    alignmentGuideRef.current = snap.guide;
    aspectRatioLockGuideRef.current = event.shiftKey ? { ...rect, rotation: 0 } : null;
  }
};
