// types
import { TPoint } from 'types/canvas';

// utils
import { buildCapArc } from './buildCapArc';
import { buildRails } from './buildRails';
import { getPointDirection } from './getPointDirection';

export const buildCapsulePolygon = (path: TPoint[], radius: number): TPoint[] => {
  const { left, right } = buildRails(path, radius);
  const startDirection = getPointDirection(path, 0);
  const endDirection = getPointDirection(path, path.length - 1);
  const startCap = buildCapArc(path[0], Math.atan2(startDirection.y, startDirection.x), -1, radius);
  const endCap = buildCapArc(path[path.length - 1], Math.atan2(endDirection.y, endDirection.x), 1, radius);

  return [...left, ...[...endCap].reverse().slice(1), ...[...right].reverse().slice(1), ...startCap.slice(1, -1)];
};
