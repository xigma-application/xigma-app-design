// types
import { TPoint } from 'types/canvas';

export const getStrokeTrianglePolygons = (vertices: number[]): TPoint[][] => {
  const polygons: TPoint[][] = [];

  for (let index = 0; index < vertices.length; index += 6) {
    polygons.push([
      { x: vertices[index], y: vertices[index + 1] },
      { x: vertices[index + 2], y: vertices[index + 3] },
      { x: vertices[index + 4], y: vertices[index + 5] },
    ]);
  }

  return polygons;
};
