// types
import { TPoint } from 'types/canvas';
import { TSceneNodeChanges } from 'types/design/types';

export const getGroupLineChildChanges = (
  childOrigin: { x1: number; x2: number; y1: number; y2: number },
  nextPoint: (worldPoint: TPoint) => TPoint,
): TSceneNodeChanges => {
  const next1 = nextPoint({ x: childOrigin.x1, y: childOrigin.y1 });
  const next2 = nextPoint({ x: childOrigin.x2, y: childOrigin.y2 });

  return { x1: Math.round(next1.x), x2: Math.round(next2.x), y1: Math.round(next1.y), y2: Math.round(next2.y) };
};
