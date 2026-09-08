// types
import { TAutoLayoutPaddingSide } from './types';
import { TPoint } from 'types/canvas';

export const getAutoLayoutPaddingPerpendicularDistance = (side: TAutoLayoutPaddingSide, point: TPoint, handleCenter: TPoint): number =>
  side === 'top' || side === 'bottom' ? Math.abs(point.x - handleCenter.x) : Math.abs(point.y - handleCenter.y);
