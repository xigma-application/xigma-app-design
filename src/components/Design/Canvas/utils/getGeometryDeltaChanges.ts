// types
import { TNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { translateVectorVertices } from './translateVectorVertices';

export const getGeometryDeltaChanges = (origin: TNodeOrigin, deltaX: number, deltaY: number): TSceneNodeChanges => {
  switch (true) {
    case 'x1' in origin:
      return {
        x1: Math.round(origin.x1 + deltaX),
        x2: Math.round(origin.x2 + deltaX),
        y1: Math.round(origin.y1 + deltaY),
        y2: Math.round(origin.y2 + deltaY),
      };
    case 'vertices' in origin:
      return { vertices: translateVectorVertices(origin.vertices, deltaX, deltaY) };
    default:
      return { x: Math.round(origin.x + deltaX), y: Math.round(origin.y + deltaY) };
  }
};
