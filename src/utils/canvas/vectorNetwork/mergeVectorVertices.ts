// types
import { TVectorNode } from 'types/design/types';

type TVectorNetworkData = Pick<TVectorNode, 'segments' | 'vertexHandleModes' | 'vertices'>;

export const mergeVectorVertices = (
  sourceNode: TVectorNetworkData,
  targetNode: TVectorNetworkData,
  sourceVertexId: string,
  targetVertexId: string,
): TVectorNetworkData => {
  const retarget = (id: string): string => (id === targetVertexId ? sourceVertexId : id);
  const segments = Object.fromEntries(
    Object.entries({ ...sourceNode.segments, ...targetNode.segments })
      .map(([id, segment]) => [id, { ...segment, endId: retarget(segment.endId), startId: retarget(segment.startId) }] as const)
      .filter(([, segment]) => segment.startId !== segment.endId),
  );
  const vertices = Object.fromEntries(
    Object.entries({ ...sourceNode.vertices, ...targetNode.vertices }).filter(([id]) => id !== targetVertexId),
  );
  const vertexHandleModes = Object.fromEntries(
    Object.entries({ ...sourceNode.vertexHandleModes, ...targetNode.vertexHandleModes }).filter(([id]) => id !== targetVertexId),
  );

  return { segments, vertexHandleModes, vertices };
};
