// utils
import { getEllipseArcStartAngleDegrees } from 'utils/canvas/ellipseArc/getEllipseArcStartAngleDegrees';

export const getEllipseArcStartValueLabelText = (arcStartAngle: number): string =>
  `Start ${getEllipseArcStartAngleDegrees(arcStartAngle)}°`;
