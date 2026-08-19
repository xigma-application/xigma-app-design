// types
import { TPoint } from 'types/canvas';
import { TRotateNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNodeChanges, TVectorVertex } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { rotateLineNodeOrigin } from './rotateLineNodeOrigin';
import { rotateShapeNodeOrigin } from './rotateShapeNodeOrigin';
import { rotateVectorNodeOrigin } from '../../../../../utils/rotateVectorNodeOrigin';

const withVertexIds = (vertices: Record<string, TPoint>): Record<string, TVectorVertex> =>
  Object.fromEntries(Object.entries(vertices).map(([id, vertex]) => [id, { id, x: vertex.x, y: vertex.y }]));

export const getRotatedNodeChanges = (
  origin: TRotateNodeOrigin,
  pivot: TPoint,
  deltaDegrees: number,
  isSingleNodeRotate: boolean,
): TSceneNodeChanges => {
  switch (true) {
    case 'x1' in origin:
      return rotateLineNodeOrigin(origin, pivot, deltaDegrees);
    case 'vertices' in origin && isSingleNodeRotate:
      return {
        rotation: Math.round((origin.rotation + deltaDegrees) * 100) / 100,
        segments: origin.segments,
        vertices: withVertexIds(origin.vertices),
      };
    case 'vertices' in origin: {
      const baked = bakeVectorNodeRotation({
        rotation: origin.rotation,
        segments: origin.segments,
        vertices: withVertexIds(origin.vertices),
      });
      return { rotation: 0, ...rotateVectorNodeOrigin(baked, pivot, deltaDegrees) };
    }
    default:
      return rotateShapeNodeOrigin(origin, pivot, deltaDegrees);
  }
};
