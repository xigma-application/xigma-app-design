// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForSegment } from './findVectorEditingNodeForSegment';
import { findVectorEditingNodeForVertex } from './findVectorEditingNodeForVertex';
import { getEffectiveTangentEnd } from 'utils/canvas/vectorNetwork/getEffectiveTangentEnd';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';

const getVertexPoint = (nodes: Record<string, TSceneNode>, vectorEditingNodeIds: string[], vertexId: string): TPoint | null =>
  findVectorEditingNodeForVertex(vectorEditingNodeIds, nodes, vertexId)?.vertices[vertexId] ?? null;

const getHandlePoint = (nodes: Record<string, TSceneNode>, vectorEditingNodeIds: string[], handle: TVectorHandleHover): TPoint | null => {
  const node = findVectorEditingNodeForSegment(vectorEditingNodeIds, nodes, handle.segmentId);
  const segment = node?.segments[handle.segmentId];

  if (node && segment) {
    const vertex = handle.end === 'start' ? node.vertices[segment.startId] : node.vertices[segment.endId];
    const tangent =
      handle.end === 'start' ? getEffectiveTangentStart(node.vertices, segment) : getEffectiveTangentEnd(node.vertices, segment);

    return getVectorHandlePosition(vertex, tangent);
  }

  return null;
};

export const getVectorMultiSelectPoints = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
): TPoint[] => [
  ...selectedVertexIds.flatMap((id) => {
    const point = getVertexPoint(nodes, vectorEditingNodeIds, id);

    return point ? [point] : [];
  }),
  ...selectedHandles.flatMap((handle) => {
    const point = getHandlePoint(nodes, vectorEditingNodeIds, handle);

    return point ? [point] : [];
  }),
];
