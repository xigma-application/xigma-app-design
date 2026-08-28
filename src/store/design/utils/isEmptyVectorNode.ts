// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

// utils
import { getActivePage } from './getActivePage';

export const isEmptyVectorNode = (state: TDesignState, id: string): boolean => {
  const node = getActivePage(state).nodes[id];

  return node !== undefined && node.type === NodeType.vector && Object.keys(node.segments).length === 0;
};
