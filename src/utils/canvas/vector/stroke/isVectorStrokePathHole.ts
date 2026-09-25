// types
import { TVectorStrokePath } from './types';

// utils
import { isPointInEvenOddPolygons } from 'utils/canvas/booleanOperation/isPointInEvenOddPolygons';

export const isVectorStrokePathHole = (path: TVectorStrokePath, paths: TVectorStrokePath[]): boolean =>
  path.closed &&
  isPointInEvenOddPolygons(
    path.points[0],
    paths.filter((other) => other.closed && other !== path).map((other) => other.points),
  );
