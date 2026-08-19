// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { isPointNearLine } from './isPointNearLine';

export const isPointNearVectorPath = (point: TPoint, node: TVectorNode, tolerance: number): boolean =>
  flattenVectorSegments(node).some(({ points }) =>
    points
      .slice(0, -1)
      .some((segmentStart, index) =>
        isPointNearLine(point, { x1: segmentStart.x, x2: points[index + 1].x, y1: segmentStart.y, y2: points[index + 1].y }, tolerance),
      ),
  );
