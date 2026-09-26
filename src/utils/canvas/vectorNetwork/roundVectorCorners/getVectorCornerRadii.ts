// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorVertexCornerRadius } from './getVectorVertexCornerRadius';

export const getVectorCornerRadii = (node: TVectorNode, vertexIds: string[]): number[] => {
  const ids = vertexIds.length > 0 ? vertexIds : Object.keys(node.vertices);

  return ids.length > 0 ? ids.map((vertexId) => getVectorVertexCornerRadius(node, vertexId)) : [node.cornerRadius ?? 0];
};
