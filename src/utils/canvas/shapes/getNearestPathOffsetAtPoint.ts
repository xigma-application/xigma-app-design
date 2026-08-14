// types
import { TEditingTextBox, TPoint } from 'types/canvas';

// utils
import { buildEllipseArcLengthTable } from './buildEllipseArcLengthTable';
import { flipTextPoint } from '../text/flipTextPoint';
import { getNearestEllipsePathOffset } from './getNearestEllipsePathOffset/getNearestEllipsePathOffset';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getNearestPathOffsetAtPoint = (point: TPoint, box: TEditingTextBox): number => {
  const table = buildEllipseArcLengthTable(box.width, box.height);
  const center: TPoint = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const unrotated = rotatePoint(point, center, -box.rotation);
  const localPoint = flipTextPoint(unrotated, box);
  const nearest = getNearestEllipsePathOffset(localPoint, { ...box, rotation: 0 }, table);

  return nearest.offset;
};
