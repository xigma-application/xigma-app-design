// types
import { TVectorNode } from 'types/design/types';

export const getExpandedSegmentIdSet = (node: TVectorNode, segmentIds: string[], vertexIdSet: Set<string>): Set<string> =>
  new Set([
    ...segmentIds,
    ...Object.entries(node.segments)
      .filter(([, segment]) => vertexIdSet.has(segment.startId) && vertexIdSet.has(segment.endId))
      .map(([id]) => id),
  ]);
