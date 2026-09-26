// types
import { TPoint } from 'types/canvas';
import { TRotateNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNodeChanges, TVectorNode, TVectorVertex } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { rotateLineNodeOrigin } from './rotateLineNodeOrigin';
import { rotateShapeNodeOrigin } from './rotateShapeNodeOrigin';
import { rotatePoint } from 'utils/math/rotatePoint';

const withVertexIds = (vertices: Record<string, TPoint>): Record<string, TVectorVertex> =>
  Object.fromEntries(Object.entries(vertices).map(([id, vertex]) => [id, { id, x: vertex.x, y: vertex.y }]));

const getOrbitedVectorChanges = (
  rotation: number,
  segments: TVectorNode['segments'],
  vertices: Record<string, TVectorVertex>,
  pivot: TPoint,
  deltaDegrees: number,
): TSceneNodeChanges => {
  const bounds = getVectorNodeBounds({ segments, vertices });
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const orbited = rotatePoint(center, pivot, deltaDegrees);
  const shift = { x: orbited.x - center.x, y: orbited.y - center.y };

  return {
    rotation: Math.round((rotation + deltaDegrees) * 100) / 100,
    segments,
    vertices: Object.fromEntries(
      Object.values(vertices).map((vertex) => [vertex.id, { ...vertex, x: vertex.x + shift.x, y: vertex.y + shift.y }]),
    ),
  };
};

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
    case 'vertices' in origin:
      return getOrbitedVectorChanges(origin.rotation, origin.segments, withVertexIds(origin.vertices), pivot, deltaDegrees);
    default:
      return rotateShapeNodeOrigin(origin, pivot, deltaDegrees);
  }
};
