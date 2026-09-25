// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TEllipseShape } from '../shapes/getEllipseFillPoints';

// utils
import { hasEllipseArc } from './hasEllipseArc';

export const hasEllipseCorners = (node: TEllipseShape): boolean =>
  (node.cornerRadius ?? 0) > 0 &&
  hasEllipseArc(node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE, node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE);
