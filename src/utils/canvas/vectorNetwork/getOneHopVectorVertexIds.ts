// types
import { TVectorNode } from 'types/design/types';

const isStraightSegment = (segment: { tangentEnd: unknown; tangentStart: unknown }): boolean =>
  !segment.tangentStart && !segment.tangentEnd;

export const getOneHopVectorVertexIds = (node: TVectorNode, selectedVertexIds: string[]): string[] => {
  const selected = new Set(selectedVertexIds);
  const expanded = new Set(selectedVertexIds);

  Object.values(node.segments).forEach((segment) => {
    if (isStraightSegment(segment)) {
      if (selected.has(segment.startId)) {
        expanded.add(segment.endId);
      }

      if (selected.has(segment.endId)) {
        expanded.add(segment.startId);
      }
    }
  });

  return Array.from(expanded);
};
