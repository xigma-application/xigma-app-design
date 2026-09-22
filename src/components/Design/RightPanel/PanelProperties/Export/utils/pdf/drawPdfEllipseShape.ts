import { PDFName, PDFPage } from 'pdf-lib';

// others
import { ELLIPSE_DEFAULT_ARC_ANGLE, ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { flipPoint } from 'utils/math/flipPoint';
import { getEffectiveArcAngles } from 'utils/canvas/ellipseArc/getEffectiveArcAngles';
import { getEllipseArcPoints } from 'utils/canvas/shapes/getEllipseArcPoints';
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { getStrokeAlignInset } from 'utils/canvas/getStrokeAlignInset/getStrokeAlignInset';
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';
import { rotatePoint } from 'utils/math/rotatePoint';

const getEllipseFillPoints = (node: TEllipseNode): TPoint[] => {
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

const getEllipseStrokeRingPoints = (node: TEllipseNode, strokeWidth: number): TPoint[][] => {
  const { inner, outer } = getStrokeAlignInset(strokeWidth, node.strokeAlign);
  const outerPoints = getEllipsePoints(
    { height: node.height + outer * 2, width: node.width + outer * 2, x: node.x - outer, y: node.y - outer },
    ELLIPSE_SEGMENTS,
  );
  const innerPoints = getEllipsePoints(
    { height: node.height - inner * 2, width: node.width - inner * 2, x: node.x + inner, y: node.y + inner },
    ELLIPSE_SEGMENTS,
  );

  return [outerPoints, innerPoints];
};

export const drawPdfEllipseShape = (
  page: PDFPage,
  node: TEllipseNode,
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const toDesign = (point: TPoint): TPoint =>
    rotatePoint(flipPoint(point, center, node.flipX ?? false, node.flipY ?? false), center, node.rotation);

  if (node.fill) {
    drawPdfPolygons(page, [getEllipseFillPoints(node).map(toDesign)], node.fill, opacity, bounds, graphicsStates);
  }

  if (node.strokeColor && node.strokeWidth) {
    drawPdfPolygons(
      page,
      getEllipseStrokeRingPoints(node, node.strokeWidth).map((polygon) => polygon.map(toDesign)),
      node.strokeColor,
      opacity,
      bounds,
      graphicsStates,
    );
  }
};
