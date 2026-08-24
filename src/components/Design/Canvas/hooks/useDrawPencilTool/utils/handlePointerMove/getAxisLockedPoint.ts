// types
import { TPoint } from 'types/canvas';

export type TPencilAxis = 'x' | 'y';

export const getAxisLockedPoint = (anchor: TPoint, current: TPoint, axis: TPencilAxis): TPoint =>
  axis === 'x' ? { x: current.x, y: anchor.y } : { x: anchor.x, y: current.y };
