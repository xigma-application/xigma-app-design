import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
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
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
  fill: string,
  sides: number,
): void => {
  const { draftRef } = canvasRefs;
  const { alignmentGuideRef, aspectRatioLockGuideRef } = canvasRefs.transform;

  if (startRef.current) {
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
    const rect = getShapeDraftRect(startRef.current, snap.point, event.shiftKey);

    draftRef.current = { ...rect, fill, sides, type: NodeType.polygon };
    alignmentGuideRef.current = snap.guide;
    aspectRatioLockGuideRef.current = event.shiftKey ? { ...rect, rotation: 0 } : null;
  }
};
