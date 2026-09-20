// types
import { TScissorRect } from './types';

export const doScissorRectsOverlap = (first: TScissorRect, second: TScissorRect): boolean =>
  first.x < second.x + second.width &&
  second.x < first.x + first.width &&
  first.y < second.y + second.height &&
  second.y < first.y + first.height;
