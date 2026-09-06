// types
import { TPoint } from 'types/canvas';

export const translateBy = (point: TPoint, deltaX: number, deltaY: number): TPoint => ({ x: point.x + deltaX, y: point.y + deltaY });
