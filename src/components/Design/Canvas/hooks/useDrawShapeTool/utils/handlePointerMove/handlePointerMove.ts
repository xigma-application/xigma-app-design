import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getPointAlignmentSnap } from '../../../../utils/getPointAlignmentSnap';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getShapeDraftRect } from '../../../../utils/getShapeDraftRect';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
  fill: string,
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section,
): void => {
  if (startRef.current) {
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
    const rect = getShapeDraftRect(startRef.current, snap.point, event.shiftKey);

    canvasRefs.draftRef.current = { ...rect, fill, type };
    canvasRefs.transform.alignmentGuideRef.current = snap.guide;
    canvasRefs.transform.aspectRatioLockGuideRef.current = event.shiftKey ? { ...rect, rotation: 0 } : null;
  }
};
