// types
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getLinePoints } from '../../line/getLinePoints';
import { getLineEndOutlinePoints } from './getLineEndOutlinePoints/getLineEndOutlinePoints';
import { getLineFrame } from '../../line/stroke/getLineFrame';
import { getLineStrokeOffset } from '../../line/stroke/getLineStrokeOffset';
import { getPolylineSegmentOffset } from 'utils/canvas/vectorNetwork/getPolylineSegmentOffset';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

const toWorld = (origin: TPoint, direction: TPoint, points: TPoint[]): TPoint[] =>
  points.map((point) => ({
    x: origin.x + point.x * direction.x - point.y * direction.y,
    y: origin.y + point.x * direction.y + point.y * direction.x,
  }));

export const getLineStrokeOutlineLoops = (node: TLineNode, halfWidth: number): TStrokeOutlineLoops | null => {
  const { x1, x2, y1, y2 } = getLinePoints(node);
  const start = { x: x1, y: y1 };
  const end = { x: x2, y: y2 };
  const unit = getPolylineSegmentOffset(start, end, 1);

  if (unit) {
    const direction = { x: unit.y, y: -unit.x };
    const endPoints = toWorld(end, direction, getLineEndOutlinePoints(node.endPoint, halfWidth));
    const startPoints = toWorld(start, { x: -direction.x, y: -direction.y }, getLineEndOutlinePoints(node.startPoint, halfWidth));
    const offset = getLineStrokeOffset(node, { ...getLineFrame(node), halfWidth });
    const outer = [...startPoints.slice(-1), ...endPoints, ...startPoints.slice(0, -1)];

    return { inner: null, outer: outer.map((point) => ({ x: point.x + offset.x, y: point.y + offset.y })) };
  }

  return null;
};
