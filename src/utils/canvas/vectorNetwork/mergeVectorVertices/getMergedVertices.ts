// types
import { TVectorVertex } from 'types/design/types';
import { TVectorNetworkData } from '../types';

export const getMergedVertices = (
  sourceNode: TVectorNetworkData,
  targetNode: TVectorNetworkData,
  targetVertexId: string,
): Record<string, TVectorVertex> =>
  Object.fromEntries(Object.entries({ ...sourceNode.vertices, ...targetNode.vertices }).filter(([id]) => id !== targetVertexId));
