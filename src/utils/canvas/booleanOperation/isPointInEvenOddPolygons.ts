// types
import { TPoint } from 'types/canvas';

// utils
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const isPointInEvenOddPolygons = (point: TPoint, polygons: TPoint[][]): boolean =>
  polygons.filter((polygon) => isPointInPolygonVertices(point, polygon)).length % 2 === 1;
