// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveVectorFillColor } from './getEffectiveVectorFillColor';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const getEffectiveVectorFill = (node: Pick<TVectorNode, 'fillColorOverrideByKey'>, loopKey: string): TPaint[] => [
  makeSolidPaint(getEffectiveVectorFillColor(node, loopKey)),
];
