// types
import { TBooleanCacheEntry } from './types';
import { TVectorNode } from 'types/design/types';

export const isBooleanCacheHit = (cached: TBooleanCacheEntry | undefined, operands: (TVectorNode | null)[]): cached is TBooleanCacheEntry =>
  cached !== undefined &&
  cached.operands.length === operands.length &&
  cached.operands.every((operand, index) => operand === operands[index]);
