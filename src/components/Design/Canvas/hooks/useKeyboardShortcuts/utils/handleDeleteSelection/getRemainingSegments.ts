// types
import { TVectorNode, TVectorSegment } from 'types/design/types';

export const getRemainingSegments = (node: TVectorNode, selectedVertexIds: string[]): Record<string, TVectorSegment> =>
  Object.fromEntries(
    Object.entries(node.segments).filter(
      ([, segment]) => !selectedVertexIds.includes(segment.startId) && !selectedVertexIds.includes(segment.endId),
    ),
  );
