// types
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getLineEndOutlinePoints } from './getLineEndOutlinePoints';
import { getPolylineSegmentOffset } from 'utils/canvas/vectorNetwork/getPolylineSegmentOffset';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

const toWorld = (origin: TPoint, direction: TPoint, points: TPoint[]): TPoint[] =>
  points.map((point) => ({
    x: origin.x + point.x * direction.x - point.y * direction.y,
    y: origin.y + point.x * direction.y + point.y * direction.x,
  }));

export const getLineStrokeOutlineLoops = (node: TLineNode, halfWidth: number): TStrokeOutlineLoops | null => {
  const start = { x: node.x1, y: node.y1 };
  const end = { x: node.x2, y: node.y2 };
  const unit = getPolylineSegmentOffset(start, end, 1);

  if (unit) {
    const direction = { x: unit.y, y: -unit.x };
    const endPoints = toWorld(end, direction, getLineEndOutlinePoints(halfWidth, node.endPoint === 'arrow'));
    const startPoints = toWorld(
      start,
      { x: -direction.x, y: -direction.y },
      getLineEndOutlinePoints(halfWidth, node.startPoint === 'arrow'),
    );

    return { inner: null, outer: [...startPoints.slice(-1), ...endPoints, ...startPoints.slice(0, -1)] };
  }

  return null;
};
