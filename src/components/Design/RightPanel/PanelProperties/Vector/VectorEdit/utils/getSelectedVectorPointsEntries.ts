// store
import { TVectorPointSelection } from 'store/design/types';

// types
import { TSelectedVectorPointsEntry } from '../types';
import { TVectorNode } from 'types/design/types';

// utils
import { getSelectedVectorHandles } from './getSelectedVectorHandles';
import { getSelectedVectorPointIds } from './getSelectedVectorPointIds';
import { getVectorHandleVertexId } from './getVectorHandleVertexId';

export const getSelectedVectorPointsEntries = (nodes: TVectorNode[], selection: TVectorPointSelection): TSelectedVectorPointsEntry[] => {
  const vertexIdsByNode = nodes.map((node) => getSelectedVectorPointIds(node, selection));
  const hasVertices = vertexIdsByNode.some((vertexIds) => vertexIds.length > 0);

  return nodes.map((node, index) => {
    const vertexIds = vertexIdsByNode[index];
    const handles = hasVertices ? [] : getSelectedVectorHandles(node, selection);
    const pointIds = hasVertices ? vertexIds : [...new Set(handles.map((handle) => getVectorHandleVertexId(node, handle)))];

    return { handles, node, pointIds, vertexIds };
  });
};
