// hooks
import { useSelectedVectorPoints } from './useSelectedVectorPoints';

// types
import { TVectorNode } from 'types/design/types';
import { TVectorPointGroup } from '../types';

// utils
import { getVectorPointGroups } from '../utils/getVectorPointGroups';

export type TVectorPointGroups = { groups: TVectorPointGroup[]; nodes: TVectorNode[] };

export const useVectorPointGroups = (): TVectorPointGroups => {
  const entries = useSelectedVectorPoints();

  return {
    groups: entries.flatMap(({ node, vertexIds }) => getVectorPointGroups(node, vertexIds)),
    nodes: entries.map(({ node }) => node),
  };
};
