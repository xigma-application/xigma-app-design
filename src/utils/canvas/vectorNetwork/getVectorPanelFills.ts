import { isEqual } from 'lodash';

// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveVectorFill } from './getEffectiveVectorFill';

export const getVectorPanelFills = (node: Pick<TVectorNode, 'fillByKey' | 'filledFaceKeys'>): TPaint[] | null => {
  const stacks = node.filledFaceKeys.map((key) => getEffectiveVectorFill(node, key));
  const [first = []] = stacks;

  return stacks.every((stack) => isEqual(stack, first)) ? first : null;
};
