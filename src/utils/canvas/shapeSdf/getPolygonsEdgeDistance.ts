// types
import { TPoint } from 'types/canvas';

// utils
import { getPointSegmentDistance } from './getPointSegmentDistance';

export const getPolygonsEdgeDistance = (point: TPoint, polygons: TPoint[][]): number =>
  polygons.reduce(
    (nearest, polygon) =>
      polygon.reduce(
        (polygonNearest, start, index) =>
          Math.min(polygonNearest, getPointSegmentDistance(point, start, polygon[(index + 1) % polygon.length])),
        nearest,
      ),
    Infinity,
  );
