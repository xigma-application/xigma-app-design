// types
import { TPoint } from 'types/canvas';

export const getAngleBetweenPoints = (from: TPoint, to: TPoint): number => (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
