// types
import { TVectorNetworkData } from '../types';

// utils
import { getMergedFilledFaceKeys } from './getMergedFilledFaceKeys';
import { getMergedSegments } from './getMergedSegments';
import { getMergedVertexHandleModes } from './getMergedVertexHandleModes';
import { getMergedVertices } from './getMergedVertices';

export const mergeVectorVertices = (
  sourceNode: TVectorNetworkData,
  targetNode: TVectorNetworkData,
  sourceVertexId: string,
  targetVertexId: string,
): TVectorNetworkData => {
  const segments = getMergedSegments(sourceNode, targetNode, sourceVertexId, targetVertexId);

  return {
    filledFaceKeys: getMergedFilledFaceKeys(sourceNode, targetNode, segments),
    segments,
    vertexHandleModes: getMergedVertexHandleModes(sourceNode, targetNode, targetVertexId),
    vertices: getMergedVertices(sourceNode, targetNode, targetVertexId),
  };
};
