// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

export const getTangentVisibilityVertexIds = (
  node: TVectorNode,
  visualSelectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
): string[] => {
  const handleVertexIds = selectedHandles.map((handle) => {
    const segment = node.segments[handle.segmentId];

    return handle.end === 'start' ? segment.startId : segment.endId;
  });

  return Array.from(new Set([...visualSelectedVertexIds, ...handleVertexIds]));
};
