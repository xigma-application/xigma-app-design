// types
import { TAutoLayoutChildPosition } from '../getAutoLayoutChildPositions';
import { TPoint } from 'types/canvas';

export const getAutoLayoutSiblingPositions = (simulatedPositions: TAutoLayoutChildPosition[]): Record<string, TPoint> =>
  simulatedPositions.reduce<Record<string, TPoint>>((positionsById, position) => {
    if (position.id !== '__dragged__') {
      positionsById[position.id] = { x: position.x, y: position.y };
    }

    return positionsById;
  }, {});
