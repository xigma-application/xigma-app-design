// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillColorForLoopKey } from './getVectorFillColorForLoopKey';

export const getEffectiveVectorFillColor = (node: Pick<TVectorNode, 'fillColorOverrideByKey'>, loopKey: string): string =>
  node.fillColorOverrideByKey?.[loopKey] ?? getVectorFillColorForLoopKey(loopKey);
