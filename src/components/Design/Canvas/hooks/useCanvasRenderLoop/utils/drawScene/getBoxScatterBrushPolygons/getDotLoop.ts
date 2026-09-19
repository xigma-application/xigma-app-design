// types
import { TPoint } from 'types/canvas';
import { TScatterDot } from './types';

// others
import { DOT_POINTS } from './constants';

export const getDotLoop = (dot: TScatterDot): TPoint[] =>
  Array.from({ length: DOT_POINTS + 1 }, (_, index) => {
    const angle = (Math.PI * 2 * (index % DOT_POINTS)) / DOT_POINTS;
    return { x: dot.x + Math.cos(angle) * dot.radius, y: dot.y + Math.sin(angle) * dot.radius };
  });
