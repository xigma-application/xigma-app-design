// types
import { BooleanOperation } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

export type TBooleanCacheEntry = { operands: (TVectorNode | null)[]; operation: BooleanOperation; result: TVectorNode | null };

export type TBooleanStyleCacheEntry = { geometry: TVectorNode; styled: TVectorNode };
