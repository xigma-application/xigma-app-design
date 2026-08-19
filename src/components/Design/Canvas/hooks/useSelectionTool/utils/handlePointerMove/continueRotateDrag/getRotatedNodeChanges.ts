// types
import { TPoint } from 'types/canvas';
import { TRotateNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { rotateLineNodeOrigin } from './rotateLineNodeOrigin';
import { rotateShapeNodeOrigin } from './rotateShapeNodeOrigin';
import { rotateVectorNodeOrigin } from '../../../../../utils/rotateVectorNodeOrigin';

export const getRotatedNodeChanges = (origin: TRotateNodeOrigin, pivot: TPoint, deltaDegrees: number): TSceneNodeChanges => {
  switch (true) {
    case 'x1' in origin:
      return rotateLineNodeOrigin(origin, pivot, deltaDegrees);
    case 'vertices' in origin:
      return rotateVectorNodeOrigin(origin, pivot, deltaDegrees);
    default:
      return rotateShapeNodeOrigin(origin, pivot, deltaDegrees);
  }
};
