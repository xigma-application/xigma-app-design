// types
import { TPoint } from 'types/canvas';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const rotateSnapshotPoint = (point: TPoint, snapshot: TVectorNodeRotateSnapshot): TPoint =>
  rotatePoint(point, snapshot.pivot, snapshot.deltaDegrees);
