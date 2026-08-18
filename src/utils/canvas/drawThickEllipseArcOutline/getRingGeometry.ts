// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getEllipseArcPoints } from '../shapes/getEllipseArcPoints';
import { getQuadVertices } from '../getQuadVertices';
import { rotatePoint } from 'utils/math/rotatePoint';

const expandRect = (rect: TDraftRect, amount: number): TDraftRect => ({
  height: rect.height + amount * 2,
  width: rect.width + amount * 2,
  x: rect.x - amount,
  y: rect.y - amount,
});

const getTransformedArcPoints = (
  bounds: TDraftRect,
  arcStartAngle: number,
  arcEndAngle: number,
  center: TPoint,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
  radiusRatio = 1,
): TPoint[] =>
  getEllipseArcPoints(bounds, arcStartAngle, arcEndAngle, ELLIPSE_SEGMENTS, radiusRatio)
    .map((point) => ({ x: flipX ? 2 * center.x - point.x : point.x, y: flipY ? 2 * center.y - point.y : point.y }))
    .map((point) => rotatePoint(point, center, rotation));

const getOpenRingVertices = (outerPoints: TPoint[], innerPoints: TPoint[]): number[] =>
  outerPoints
    .slice(0, -1)
    .flatMap((outerPoint, index) =>
      getQuadVertices(
        outerPoint.x,
        outerPoint.y,
        outerPoints[index + 1].x,
        outerPoints[index + 1].y,
        innerPoints[index + 1].x,
        innerPoints[index + 1].y,
        innerPoints[index].x,
        innerPoints[index].y,
      ),
    );

export const getRingGeometry = (
  rect: TDraftRect,
  halfWidth: number,
  arcStartAngle: number,
  arcEndAngle: number,
  center: TPoint,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
): { rimPoints: TPoint[]; vertices: number[] } => {
  const outerPoints = getTransformedArcPoints(expandRect(rect, halfWidth), arcStartAngle, arcEndAngle, center, flipX, flipY, rotation);
  const innerPoints = getTransformedArcPoints(expandRect(rect, -halfWidth), arcStartAngle, arcEndAngle, center, flipX, flipY, rotation);
  const rimPoints = getTransformedArcPoints(rect, arcStartAngle, arcEndAngle, center, flipX, flipY, rotation);

  return { rimPoints, vertices: getOpenRingVertices(outerPoints, innerPoints) };
};
