// types
import { TVectorSegment } from 'types/design/types';
import { TVectorNetworkData } from '../types';

// utils
import { retargetVertexId } from './retargetVertexId';

export const getMergedSegments = (
  sourceNode: TVectorNetworkData,
  targetNode: TVectorNetworkData,
  sourceVertexId: string,
  targetVertexId: string,
): Record<string, TVectorSegment> =>
  Object.fromEntries(
    Object.entries({ ...sourceNode.segments, ...targetNode.segments })
      .map(
        ([id, segment]) =>
          [
            id,
            {
              ...segment,
              endId: retargetVertexId(segment.endId, sourceVertexId, targetVertexId),
              startId: retargetVertexId(segment.startId, sourceVertexId, targetVertexId),
            },
          ] as const,
      )
      .filter(([, segment]) => segment.startId !== segment.endId),
  );
