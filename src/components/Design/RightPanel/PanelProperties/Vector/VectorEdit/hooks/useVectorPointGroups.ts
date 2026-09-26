// hooks
import { useSelectedVectorPoints } from './useSelectedVectorPoints';

// types
import { TVectorNode } from 'types/design/types';
import { TVectorPointGroup } from '../types';

// utils
import { getVectorPointGroups } from '../utils/getVectorPointGroups';

export type TVectorPointGroups = { groups: TVectorPointGroup[]; node: TVectorNode | undefined };

export const useVectorPointGroups = (): TVectorPointGroups => {
  const { node, vertexIds } = useSelectedVectorPoints();

  return { groups: node ? getVectorPointGroups(node, vertexIds) : [], node };
};
