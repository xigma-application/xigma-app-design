// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenSegment } from './flattenSegment';
import { getVectorCurveSegmentCount } from './getVectorCurveSegmentCount';

const isPointInRect = (point: TPoint, rect: TDraftRect): boolean =>
  point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;

const cross = (a: TPoint, b: TPoint, c: TPoint): number => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

const doSegmentsIntersect = (p1: TPoint, p2: TPoint, p3: TPoint, p4: TPoint): boolean => {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);

  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
};

const getRectEdges = (rect: TDraftRect): [TPoint, TPoint][] => {
  const topLeft = { x: rect.x, y: rect.y };
  const topRight = { x: rect.x + rect.width, y: rect.y };
  const bottomRight = { x: rect.x + rect.width, y: rect.y + rect.height };
  const bottomLeft = { x: rect.x, y: rect.y + rect.height };

  return [
    [topLeft, topRight],
    [topRight, bottomRight],
    [bottomRight, bottomLeft],
    [bottomLeft, topLeft],
  ];
};

const doesPolylineIntersectRect = (points: TPoint[], rect: TDraftRect): boolean => {
  if (points.some((point) => isPointInRect(point, rect))) {
    return true;
  }

  const rectEdges = getRectEdges(rect);

  return points.slice(0, -1).some((point, index) => {
    const next = points[index + 1];

    return rectEdges.some(([edgeStart, edgeEnd]) => doSegmentsIntersect(point, next, edgeStart, edgeEnd));
  });
};

export const getVectorSegmentsInRect = (node: TVectorNode, rect: TDraftRect): string[] =>
  Object.values(node.segments)
    .filter((segment) => {
      const start = node.vertices[segment.startId];
      const end = node.vertices[segment.endId];
      const points = flattenSegment(
        start,
        end,
        segment.tangentStart,
        segment.tangentEnd,
        getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd),
      );

      return doesPolylineIntersectRect(points, rect);
    })
    .map((segment) => segment.id);
