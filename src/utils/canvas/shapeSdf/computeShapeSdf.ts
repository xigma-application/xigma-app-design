// others
import { SHAPE_SDF_MAX_RESOLUTION, SHAPE_SDF_PADDING } from './constants';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TShapeSdf } from './types';

// utils
import { getPolygonsEdgeDistance } from './getPolygonsEdgeDistance';
import { isPointInEvenOddPolygons } from '../booleanOperation/isPointInEvenOddPolygons';

export const computeShapeSdf = (polygons: TPoint[][], bounds: TDraftRect): TShapeSdf => {
  const origin = { x: bounds.x - SHAPE_SDF_PADDING, y: bounds.y - SHAPE_SDF_PADDING };
  const paddedWidth = bounds.width + SHAPE_SDF_PADDING * 2;
  const paddedHeight = bounds.height + SHAPE_SDF_PADDING * 2;
  const cellSize = Math.max(paddedWidth, paddedHeight) / SHAPE_SDF_MAX_RESOLUTION;
  const width = Math.max(1, Math.ceil(paddedWidth / cellSize));
  const height = Math.max(1, Math.ceil(paddedHeight / cellSize));
  const values = new Float32Array(width * height);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const point = { x: origin.x + (column + 0.5) * cellSize, y: origin.y + (row + 0.5) * cellSize };
      const distance = getPolygonsEdgeDistance(point, polygons);

      values[row * width + column] = isPointInEvenOddPolygons(point, polygons) ? -distance : distance;
    }
  }

  return { cellSize, height, origin, values, width };
};
