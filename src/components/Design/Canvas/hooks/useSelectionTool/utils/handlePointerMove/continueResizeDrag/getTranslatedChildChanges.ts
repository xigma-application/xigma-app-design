// types
import { TPoint } from 'types/canvas';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNodeChanges, TVectorVertex } from 'types/design/types';

export const getTranslatedChildChanges = (childOrigin: TResizeNodeOrigin, delta: TPoint): TSceneNodeChanges => {
  if ('x1' in childOrigin) {
    return {
      x1: Math.round(childOrigin.x1 + delta.x),
      x2: Math.round(childOrigin.x2 + delta.x),
      y1: Math.round(childOrigin.y1 + delta.y),
      y2: Math.round(childOrigin.y2 + delta.y),
    };
  }

  if ('vertices' in childOrigin) {
    const vertices: Record<string, TVectorVertex> = {};

    Object.entries(childOrigin.vertices).forEach(([id, vertex]) => {
      vertices[id] = { id, x: vertex.x + delta.x, y: vertex.y + delta.y };
    });

    return { vertices };
  }

  return { x: Math.round(childOrigin.x + delta.x), y: Math.round(childOrigin.y + delta.y) };
};
