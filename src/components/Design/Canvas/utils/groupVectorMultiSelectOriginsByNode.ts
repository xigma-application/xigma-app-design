// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForSegment } from './findVectorEditingNodeForSegment';
import { findVectorEditingNodeForVertex } from './findVectorEditingNodeForVertex';

export type TVectorMultiSelectOriginGroup = { handleKeys: string[]; vertexIds: string[] };
export type TVectorMultiSelectOriginGroups = Record<string, TVectorMultiSelectOriginGroup>;

const getSegmentIdFromHandleKey = (handleKey: string): string => handleKey.split(':')[1];

export const groupVectorMultiSelectOriginsByNode = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  vertexOrigins: Record<string, TPoint>,
  handleOrigins: Record<string, TPoint>,
): TVectorMultiSelectOriginGroups => {
  const groups: TVectorMultiSelectOriginGroups = {};
  const ensureGroup = (nodeId: string): TVectorMultiSelectOriginGroup => {
    groups[nodeId] ??= { handleKeys: [], vertexIds: [] };
    return groups[nodeId];
  };

  Object.keys(vertexOrigins).forEach((vertexId) => {
    const node = findVectorEditingNodeForVertex(vectorEditingNodeIds, nodes, vertexId);

    if (node) {
      ensureGroup(node.id).vertexIds.push(vertexId);
    }
  });

  Object.keys(handleOrigins).forEach((handleKey) => {
    const node = findVectorEditingNodeForSegment(vectorEditingNodeIds, nodes, getSegmentIdFromHandleKey(handleKey));

    if (node) {
      ensureGroup(node.id).handleKeys.push(handleKey);
    }
  });

  return groups;
};
