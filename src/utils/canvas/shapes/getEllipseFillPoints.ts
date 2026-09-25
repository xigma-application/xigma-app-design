// others
import { ELLIPSE_CORNER_SEGMENTS, ELLIPSE_DEFAULT_ARC_ANGLE, ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEffectiveArcAngles } from 'utils/canvas/ellipseArc/getEffectiveArcAngles';
import { getEllipseArcCornerIndices } from 'utils/canvas/ellipseArc/getEllipseArcCornerIndices';
import { getEllipseArcPoints } from './getEllipseArcPoints';
import { getEllipsePoints } from './getEllipsePoints';
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';
import { roundPolygonCorners } from 'utils/canvas/ellipseArc/roundPolygonCorners';

export type TEllipseShape = TDraftRect &
  Pick<TEllipseNode, 'arcEndAngle' | 'arcRatio' | 'arcRatioInverted' | 'arcStartAngle' | 'cornerRadius'>;

const getArcPoints = (node: TEllipseShape, arcStartAngle: number, arcEndAngle: number, arcRatio: number): TPoint[] => {
  const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(arcStartAngle, arcEndAngle, node.arcRatioInverted ?? false);
  const outerPoints = getEllipseArcPoints(node, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS);

  return arcRatio > 0
    ? [...outerPoints, ...[...getEllipseArcPoints(node, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS, arcRatio)].reverse()]
    : [{ x: node.x + node.width / 2, y: node.y + node.height / 2 }, ...outerPoints];
};

export const getEllipseFillPoints = (node: TEllipseShape): TPoint[] => {
  const arcStartAngle = node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcEndAngle = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcRatio = node.arcRatio ?? 0;
  const hasArc = hasEllipseArc(arcStartAngle, arcEndAngle);

  if (hasArc || arcRatio > 0) {
    const points = getArcPoints(node, arcStartAngle, arcEndAngle, arcRatio);

    return hasArc && (node.cornerRadius ?? 0) > 0
      ? roundPolygonCorners(
          points,
          getEllipseArcCornerIndices(points.length, arcRatio > 0),
          node.cornerRadius as number,
          ELLIPSE_CORNER_SEGMENTS,
        )
      : points;
  }

  return getEllipsePoints(node, ELLIPSE_SEGMENTS);
};
