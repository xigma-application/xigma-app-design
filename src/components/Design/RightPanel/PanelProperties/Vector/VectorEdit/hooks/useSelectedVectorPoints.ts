// store
import { selectNodes, selectVectorEditingNodeIds, selectVectorPointSelection } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getSelectedVectorHandles } from '../utils/getSelectedVectorHandles';
import { getSelectedVectorPointIds } from '../utils/getSelectedVectorPointIds';
import { getVectorHandleVertexId } from '../utils/getVectorHandleVertexId';

export type TSelectedVectorPoints = {
  handles: TVectorHandleHover[];
  node: TVectorNode | undefined;
  pointIds: string[];
  vertexIds: string[];
};

export const useSelectedVectorPoints = (): TSelectedVectorPoints => {
  const nodes = useAppSelector(selectNodes);
  const [nodeId] = useAppSelector(selectVectorEditingNodeIds);
  const selection = useAppSelector(selectVectorPointSelection);
  const editingNode = nodes[nodeId];
  const node = editingNode?.type === NodeType.vector ? editingNode : undefined;
  const vertexIds = node ? getSelectedVectorPointIds(node, selection) : [];
  const handles = node && vertexIds.length === 0 ? getSelectedVectorHandles(node, selection) : [];
  const pointIds = vertexIds.length > 0 ? vertexIds : [...new Set(handles.map((handle) => getVectorHandleVertexId(node!, handle)))];

  return { handles, node, pointIds, vertexIds };
};
