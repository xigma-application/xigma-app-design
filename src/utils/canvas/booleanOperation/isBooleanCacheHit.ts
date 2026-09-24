// types
import { BooleanOperation } from 'types/design/enums';
import { TBooleanCacheEntry } from './types';
import { TVectorNode } from 'types/design/types';

export const isBooleanCacheHit = (
  cached: TBooleanCacheEntry | undefined,
  operation: BooleanOperation,
  operands: (TVectorNode | null)[],
): cached is TBooleanCacheEntry =>
  cached !== undefined &&
  cached.operation === operation &&
  cached.operands.length === operands.length &&
  cached.operands.every((operand, index) => operand === operands[index]);
