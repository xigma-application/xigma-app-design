// types
import { TDraftRect } from 'types/canvas';
import { TSvgGradientGeometry } from './getSvgGradientGeometry';

// utils
import { toSvgPagePoint } from './toSvgPagePoint';

const DIAMOND_REACH_MARGIN = 1.1;

export const getSvgDiamondGradientReach = (
  geometry: TSvgGradientGeometry,
  radiusRatio: number,
  fillBounds: TDraftRect,
  pageBounds: TDraftRect,
): number => {
  if (geometry.primaryRadius === 0) {
    return Math.hypot(fillBounds.width, fillBounds.height) * DIAMOND_REACH_MARGIN;
  }

  const corners = [
    { x: fillBounds.x, y: fillBounds.y },
    { x: fillBounds.x + fillBounds.width, y: fillBounds.y },
    { x: fillBounds.x + fillBounds.width, y: fillBounds.y + fillBounds.height },
    { x: fillBounds.x, y: fillBounds.y + fillBounds.height },
  ];
  const maxDiamondDistance = Math.max(
    ...corners.map((corner) => {
      const point = toSvgPagePoint(corner, pageBounds);
      const relativeX = point.x - geometry.start.x;
      const relativeY = point.y - geometry.start.y;
      const a = (relativeX * geometry.direction.x + relativeY * geometry.direction.y) / geometry.primaryRadius;
      const b = (relativeX * geometry.perpendicular.x + relativeY * geometry.perpendicular.y) / (geometry.primaryRadius * radiusRatio);

      return Math.abs(a) + Math.abs(b);
    }),
  );

  return Math.max(1, maxDiamondDistance) * DIAMOND_REACH_MARGIN;
};
