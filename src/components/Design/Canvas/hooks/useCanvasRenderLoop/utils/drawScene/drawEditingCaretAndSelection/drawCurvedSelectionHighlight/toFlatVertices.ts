// types
import { TPoint } from 'types/canvas';

export const toFlatVertices = (points: TPoint[]): number[] => points.flatMap((point) => [point.x, point.y]);
