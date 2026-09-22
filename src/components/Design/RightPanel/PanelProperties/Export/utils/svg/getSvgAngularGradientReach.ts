// types
import { TDraftRect } from 'types/canvas';
import { TSvgGradientGeometry } from './getSvgGradientGeometry';

// utils
import { toSvgPagePoint } from './toSvgPagePoint';

const ANGULAR_REACH_MARGIN = 4;

export const getSvgAngularGradientReach = (geometry: TSvgGradientGeometry, fillBounds: TDraftRect, pageBounds: TDraftRect): number => {
  const corners = [
    { x: fillBounds.x, y: fillBounds.y },
    { x: fillBounds.x + fillBounds.width, y: fillBounds.y },
    { x: fillBounds.x + fillBounds.width, y: fillBounds.y + fillBounds.height },
    { x: fillBounds.x, y: fillBounds.y + fillBounds.height },
  ];

  return (
    Math.max(
      ...corners.map((corner) => {
        const point = toSvgPagePoint(corner, pageBounds);

        return Math.hypot(point.x - geometry.start.x, point.y - geometry.start.y);
      }),
    ) * ANGULAR_REACH_MARGIN
  );
};
