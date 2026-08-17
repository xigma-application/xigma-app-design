// types
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const rotateFlatVertices = (flat: number[], center: TPoint, rotation: number): number[] =>
  Array.from({ length: flat.length / 2 }, (_, index) =>
    rotatePoint({ x: flat[index * 2], y: flat[index * 2 + 1] }, center, rotation),
  ).flatMap((point) => [point.x, point.y]);
