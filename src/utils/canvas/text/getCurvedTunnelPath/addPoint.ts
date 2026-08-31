// types
import { TPoint } from 'types/canvas';

export const addPoint = (point: TPoint, offset: TPoint): TPoint => ({ x: point.x + offset.x, y: point.y + offset.y });
