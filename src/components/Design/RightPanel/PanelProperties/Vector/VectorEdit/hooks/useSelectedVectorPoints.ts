// store
import { selectNodes, selectVectorEditingNodeIds, selectVectorPointSelection } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSelectedVectorPointsEntry } from '../types';
import { TVectorNode } from 'types/design/types';

// utils
import { getSelectedVectorPointsEntries } from '../utils/getSelectedVectorPointsEntries';

export const useSelectedVectorPoints = (): TSelectedVectorPointsEntry[] => {
  const nodes = useAppSelector(selectNodes);
  const editingNodes = useAppSelector(selectVectorEditingNodeIds)
    .map((nodeId) => nodes[nodeId])
    .filter((node): node is TVectorNode => node?.type === NodeType.vector);

  return getSelectedVectorPointsEntries(editingNodes, useAppSelector(selectVectorPointSelection));
};
