// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from '../deriveVectorFaces/deriveVectorFaces';
import { getInteriorSegmentIds } from './getInteriorSegmentIds';
import { getRemainingVertices } from '../getRemainingVertices';
import { getVectorFillLoopKey } from '../getVectorFillLoopKey';

export const mergeVectorFaces = (node: TVectorNode, touchedFaces: TVectorFace[]): TVectorNode => {
  const interiorSegmentIds = getInteriorSegmentIds(node, touchedFaces);
  const segments = Object.fromEntries(Object.entries(node.segments).filter(([id]) => !interiorSegmentIds.includes(id)));
  const vertices = getRemainingVertices(node.vertices, segments);
  const mergedNode = { ...node, segments, vertices };
  const touchedPieceKeys = new Set(touchedFaces.flatMap((face) => face.pieceKeys));
  const resultingFaces = deriveVectorFaces(mergedNode).filter((face) => face.pieceKeys.every((pieceKey) => touchedPieceKeys.has(pieceKey)));
  const filledFaceKeys = [...new Set([...node.filledFaceKeys, ...resultingFaces.map((face) => getVectorFillLoopKey(face.pieceKeys))])];

  return { ...mergedNode, filledFaceKeys };
};
