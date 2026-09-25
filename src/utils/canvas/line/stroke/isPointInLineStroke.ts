// types
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getLineStrokeShape } from './getLineStrokeShape';
import { isPointInEvenOddPolygons } from '../../booleanOperation/isPointInEvenOddPolygons';

export const isPointInLineStroke = (point: TPoint, line: TLineNode): boolean => {
  const shape = getLineStrokeShape(line);

  switch (shape?.fillRule) {
    case 'nonZero':
      return shape.polygons.some((polygon) => isPointInEvenOddPolygons(point, [polygon]));
    case 'evenOdd':
      return isPointInEvenOddPolygons(point, shape.polygons);
    default:
      return false;
  }
};
