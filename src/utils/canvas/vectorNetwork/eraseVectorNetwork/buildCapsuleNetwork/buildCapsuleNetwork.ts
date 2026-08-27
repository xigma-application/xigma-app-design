// types
import { TCapsuleNetwork } from './types';
import { TPoint } from 'types/canvas';

// utils
import { buildCapsulePolygon } from './buildCapsulePolygon';
import { buildCircle } from './buildCircle';
import { buildClosedLoopNetwork } from './buildClosedLoopNetwork';

export const buildCapsuleNetwork = (path: TPoint[], radius: number): TCapsuleNetwork => {
  const polygon = path.length === 1 ? buildCircle(path[0], radius) : buildCapsulePolygon(path, radius);
  const { segments, vertices } = buildClosedLoopNetwork(polygon);

  return { polygon, segments, vertices };
};
