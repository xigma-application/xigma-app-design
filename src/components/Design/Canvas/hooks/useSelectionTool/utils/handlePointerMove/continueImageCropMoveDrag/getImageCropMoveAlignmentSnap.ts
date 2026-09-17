// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { extendGuideToFullElement } from 'components/Design/Canvas/utils/getDragAlignmentSnap/extendGuideToFullElement';
import { getGroupAlignmentGuide, TAlignmentGuide } from 'components/Design/Canvas/utils/getGroupAlignmentGuide';
import { getShapeSnapPoints } from 'components/Design/Canvas/utils/getShapeSnapPoints';

export type TImageCropMoveAlignmentSnap = {
  delta: TPoint;
  guide: TAlignmentGuide | null;
};

export const getImageCropMoveAlignmentSnap = (
  cropBoundsAtDelta: TDraftRect,
  frameBounds: TDraftRect,
  rawDelta: TPoint,
  toleranceWorldUnits: number,
): TImageCropMoveAlignmentSnap => {
  const frameCandidate = { bounds: frameBounds, points: getShapeSnapPoints(frameBounds) };
  const draggedPoints = getShapeSnapPoints(cropBoundsAtDelta);
  const { deltaCorrection, guide } = getGroupAlignmentGuide(draggedPoints, frameCandidate.points, toleranceWorldUnits);

  return {
    delta: { x: rawDelta.x + deltaCorrection.x, y: rawDelta.y + deltaCorrection.y },
    guide: extendGuideToFullElement(guide, [frameCandidate]),
  };
};
