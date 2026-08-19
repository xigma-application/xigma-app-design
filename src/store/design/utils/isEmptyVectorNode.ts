// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

export const isEmptyVectorNode = (state: TDesignState, id: string): boolean => {
  const node = state.nodes[id];

  return node !== undefined && node.type === NodeType.vector && Object.keys(node.segments).length === 0;
};
