// types
import { TVertexHandleMode } from 'types/design/types';
import { TVectorNetworkData } from './types';

export const getMergedVertexHandleModes = (
  sourceNode: TVectorNetworkData,
  targetNode: TVectorNetworkData,
  targetVertexId: string,
): Record<string, TVertexHandleMode> =>
  Object.fromEntries(
    Object.entries({ ...sourceNode.vertexHandleModes, ...targetNode.vertexHandleModes }).filter(([id]) => id !== targetVertexId),
  );
