// types
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

type TFrameBox = { height: number; rotation: number; width: number; x: number; y: number };

export const getFreeformFrameTopLeftDelta = (origin: TFrameBox, current: TFrameBox): TPoint => {
  const originCenter: TPoint = { x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 };
  const currentCenter: TPoint = { x: current.x + current.width / 2, y: current.y + current.height / 2 };
  const originTopLeft = rotatePoint({ x: origin.x, y: origin.y }, originCenter, origin.rotation);
  const currentTopLeft = rotatePoint({ x: current.x, y: current.y }, currentCenter, current.rotation);

  return { x: currentTopLeft.x - originTopLeft.x, y: currentTopLeft.y - originTopLeft.y };
};
