// types
import { TEditingTextBox, TPoint } from 'types/canvas';

// utils
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

export const transformPoints = (points: TPoint[], box: TEditingTextBox, center: TPoint): TPoint[] =>
  points.map((point) => flipTextPoint(point, box)).map((point) => rotatePoint(point, center, box.rotation));
