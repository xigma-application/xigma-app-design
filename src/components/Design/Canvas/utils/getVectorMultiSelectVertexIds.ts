// types
import { TSceneNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForSegment } from './findVectorEditingNodeForSegment';

const getSegmentVertexIds = (nodes: Record<string, TSceneNode>, vectorEditingNodeIds: string[], segmentId: string): string[] => {
  const node = findVectorEditingNodeForSegment(vectorEditingNodeIds, nodes, segmentId);
  const segment = node?.segments[segmentId];

  return segment ? [segment.startId, segment.endId] : [];
};

export const getVectorMultiSelectVertexIds = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedSegmentIds: string[],
): string[] =>
  Array.from(new Set([...selectedVertexIds, ...selectedSegmentIds.flatMap((id) => getSegmentVertexIds(nodes, vectorEditingNodeIds, id))]));
