// types
import { TPoint } from 'types/canvas';
import { TVectorTangent } from 'types/design/types';

// others
import { QUADRATIC_TO_CUBIC_RATIO } from './constants';

export const getQuadraticAsCubicTangents = (
  start: TPoint,
  end: TPoint,
  control: TPoint,
): { tangentEnd: TVectorTangent; tangentStart: TVectorTangent } => ({
  tangentEnd: { x: (control.x - end.x) * QUADRATIC_TO_CUBIC_RATIO, y: (control.y - end.y) * QUADRATIC_TO_CUBIC_RATIO },
  tangentStart: { x: (control.x - start.x) * QUADRATIC_TO_CUBIC_RATIO, y: (control.y - start.y) * QUADRATIC_TO_CUBIC_RATIO },
});
