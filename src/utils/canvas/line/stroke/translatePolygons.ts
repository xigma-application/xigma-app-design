// types
import { TPoint } from 'types/canvas';

export const translatePolygons = (polygons: TPoint[][], offset: TPoint): TPoint[][] =>
  polygons.map((polygon) => polygon.map((point) => ({ x: point.x + offset.x, y: point.y + offset.y })));
