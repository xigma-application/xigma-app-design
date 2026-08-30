// types
import { TPoint } from 'types/canvas';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNodeChanges, TVectorVertex } from 'types/design/types';

export const getGroupVectorChildChanges = (
  childOrigin: TVectorNodeOrigin,
  nextPoint: (worldPoint: TPoint) => TPoint,
): TSceneNodeChanges => {
  const vertices: Record<string, TVectorVertex> = {};

  Object.entries(childOrigin.vertices).forEach(([id, vertex]) => {
    const next = nextPoint(vertex);
    vertices[id] = { id, x: next.x, y: next.y };
  });

  return { vertices };
};
