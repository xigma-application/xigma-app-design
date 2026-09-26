// store
import { selectNodes, selectVectorEditingNodeIds, selectVectorPointSelection } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getSelectedVectorPointIds } from '../utils/getSelectedVectorPointIds';

export type TSelectedVectorPoints = { node: TVectorNode | undefined; vertexIds: string[] };

export const useSelectedVectorPoints = (): TSelectedVectorPoints => {
  const nodes = useAppSelector(selectNodes);
  const [nodeId] = useAppSelector(selectVectorEditingNodeIds);
  const selection = useAppSelector(selectVectorPointSelection);
  const editingNode = nodes[nodeId];
  const node = editingNode?.type === NodeType.vector ? editingNode : undefined;

  return { node, vertexIds: node ? getSelectedVectorPointIds(node, selection) : [] };
};
