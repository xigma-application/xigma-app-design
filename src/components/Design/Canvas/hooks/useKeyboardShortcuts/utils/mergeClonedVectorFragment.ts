import { nanoid } from '@reduxjs/toolkit';

// types
import { TSceneNodeChanges, TVectorNode } from 'types/design/types';
import { TVectorFragment } from '../types';

// utils
import { getDuplicatedFilledFaceKeys } from './getDuplicatedFilledFaceKeys';

export type TMergedVectorFragment = {
  changes: TSceneNodeChanges;
  newSegmentIds: string[];
  newVertexIds: string[];
};

export const mergeClonedVectorFragment = (
  targetNode: TVectorNode,
  fragment: TVectorFragment,
  offsetX: number,
  offsetY: number,
): TMergedVectorFragment => {
  const idMap = new Map(fragment.vertices.map((vertex) => [vertex.id, nanoid()]));
  const segmentIdMap = new Map(fragment.segments.map((segment) => [segment.id, nanoid()]));
  const newVertices = fragment.vertices.map((vertex) => ({
    id: idMap.get(vertex.id) as string,
    x: Math.round(vertex.x + offsetX),
    y: Math.round(vertex.y + offsetY),
  }));
  const newSegments = fragment.segments.map((segment) => ({
    ...segment,
    endId: idMap.get(segment.endId) as string,
    id: segmentIdMap.get(segment.id) as string,
    startId: idMap.get(segment.startId) as string,
  }));
  const newVertexHandleModes = Object.fromEntries(
    Object.entries(fragment.vertexHandleModes).map(([id, mode]) => [idMap.get(id) as string, mode]),
  );
  const mergedSegments = { ...targetNode.segments, ...Object.fromEntries(newSegments.map((segment) => [segment.id, segment])) };
  const mergedVertices = { ...targetNode.vertices, ...Object.fromEntries(newVertices.map((vertex) => [vertex.id, vertex])) };
  const newFilledFaceKeys = getDuplicatedFilledFaceKeys(fragment.filledFacePieceKeySets, idMap, segmentIdMap);

  return {
    changes: {
      filledFaceKeys: [...targetNode.filledFaceKeys, ...newFilledFaceKeys],
      segments: mergedSegments,
      vertexHandleModes: { ...targetNode.vertexHandleModes, ...newVertexHandleModes },
      vertices: mergedVertices,
    },
    newSegmentIds: newSegments.map((segment) => segment.id),
    newVertexIds: newVertices.map((vertex) => vertex.id),
  };
};
