// types
import { TPoint } from 'types/canvas';
import { TPointAlignmentSnap } from 'components/Design/Canvas/utils/getPointAlignmentSnap';

export const maskSnapToActiveAxes = (
  snap: TPointAlignmentSnap,
  queryPoint: TPoint,
  affectsWidth: boolean,
  affectsHeight: boolean,
): TPointAlignmentSnap => {
  const horizontal = affectsHeight ? (snap.guide?.horizontal ?? null) : null;
  const vertical = affectsWidth ? (snap.guide?.vertical ?? null) : null;

  return {
    guide: horizontal || vertical ? { horizontal, vertical } : null,
    point: { x: affectsWidth ? snap.point.x : queryPoint.x, y: affectsHeight ? snap.point.y : queryPoint.y },
  };
};
