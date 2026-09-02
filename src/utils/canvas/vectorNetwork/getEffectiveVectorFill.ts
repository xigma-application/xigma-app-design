// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillColorForLoopKey } from './getVectorFillColorForLoopKey';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const getEffectiveVectorFill = (node: Pick<TVectorNode, 'fillByKey'>, loopKey: string): TPaint[] =>
  node.fillByKey?.[loopKey] ?? [makeSolidPaint(getVectorFillColorForLoopKey(loopKey))];
