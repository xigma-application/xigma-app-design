// types
import { TDistanceGuideLine } from '../getDistanceGuides/types';
import { TPoint } from 'types/canvas';
import { TVectorDistanceGuideParts } from './types';

// utils
import { getLabel } from '../getDistanceGuides/getLabel';
import { getPointToPointGuides } from './getPointToPointGuides';
import { getPolylineSubpath } from './getPolylineSubpath';
import { projectPointOntoPolyline } from './projectPointOntoPolyline';

const EPS = 1e-6;

const toDashedRun = (points: TPoint[]): TDistanceGuideLine[] =>
  points.slice(0, -1).map((point, index) => ({ dashed: true, x1: point.x, x2: points[index + 1].x, y1: point.y, y2: points[index + 1].y }));

export const getPointToSegmentGuides = (a: TPoint, polyline: TPoint[]): TVectorDistanceGuideParts => {
  const projection = projectPointOntoPolyline(a, polyline);

  if (projection.atEndpoint) {
    return getPointToPointGuides(a, projection.atEndpoint === 'start' ? polyline[0] : polyline[polyline.length - 1]);
  }

  const { foot, lengthFromStart, perpDistance, totalLength } = projection;
  const startRun = getPolylineSubpath(polyline, foot, lengthFromStart, 'start');
  const endRun = getPolylineSubpath(polyline, foot, lengthFromStart, 'end');
  const lines: TDistanceGuideLine[] = [...toDashedRun(startRun), ...toDashedRun(endRun)];
  const labels = [
    getLabel(
      startRun[0].x,
      startRun[0].y,
      startRun[startRun.length - 1].x,
      startRun[startRun.length - 1].y,
      { x: 0, y: -1 },
      lengthFromStart,
    ),
    getLabel(
      endRun[0].x,
      endRun[0].y,
      endRun[endRun.length - 1].x,
      endRun[endRun.length - 1].y,
      { x: 0, y: -1 },
      totalLength - lengthFromStart,
    ),
  ];

  if (perpDistance >= EPS) {
    lines.push({ dashed: false, x1: a.x, x2: foot.x, y1: a.y, y2: foot.y });
    labels.push(getLabel(a.x, a.y, foot.x, foot.y, { x: 1, y: 0 }, perpDistance));
  }

  return { labels, lines };
};
