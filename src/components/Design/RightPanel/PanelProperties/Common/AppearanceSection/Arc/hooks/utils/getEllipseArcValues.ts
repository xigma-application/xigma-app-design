// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TArcValues } from '../../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipseArcStartAngleDegrees } from 'utils/canvas/ellipseArc/getEllipseArcStartAngleDegrees';
import { getEllipseArcSweepPercent } from 'utils/canvas/ellipseArc/getEllipseArcSweepPercent';

export const getEllipseArcValues = (node: TEllipseNode): TArcValues => {
  const start = node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const end = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;

  return {
    ratio: (node.arcRatio ?? 0) * 100,
    start: getEllipseArcStartAngleDegrees(start),
    sweep: getEllipseArcSweepPercent(start, end) ?? 100,
  };
};
