// others
import { ELLIPSE_DEFAULT_ARC_ANGLE, ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEffectiveArcAngles } from 'utils/canvas/ellipseArc/getEffectiveArcAngles';
import { getEllipseArcPoints } from './getEllipseArcPoints';
import { getEllipsePoints } from './getEllipsePoints';
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';

export const getEllipseFillPoints = (node: TEllipseNode): TPoint[] => {
  const arcStartAngle = node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcEndAngle = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcRatio = node.arcRatio ?? 0;

  if (hasEllipseArc(arcStartAngle, arcEndAngle) || arcRatio > 0) {
    const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(arcStartAngle, arcEndAngle, node.arcRatioInverted ?? false);
    const outerPoints = getEllipseArcPoints(node, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS);

    if (arcRatio > 0) {
      const innerPoints = getEllipseArcPoints(node, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS, arcRatio);
      return [...outerPoints, ...[...innerPoints].reverse()];
    }

    return [{ x: node.x + node.width / 2, y: node.y + node.height / 2 }, ...outerPoints];
  }

  return getEllipsePoints(node, ELLIPSE_SEGMENTS);
};
