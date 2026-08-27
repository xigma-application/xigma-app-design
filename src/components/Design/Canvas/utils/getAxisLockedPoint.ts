// types
import { TPoint } from 'types/canvas';

export type TAxisLock = 'x' | 'y';

export const getAxisLockedPoint = (anchor: TPoint, current: TPoint, axis: TAxisLock): TPoint =>
  axis === 'x' ? { x: current.x, y: anchor.y } : { x: anchor.x, y: current.y };
