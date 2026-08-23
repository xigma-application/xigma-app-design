// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from '../deriveVectorFaces';
import { getFaceKeysBySegmentId } from './getFaceKeysBySegmentId';

export const getExclusiveSegmentIds = (node: TVectorNode, touchedFaces: TVectorFace[]): string[] => {
  const touchedFaceKeys = new Set(touchedFaces.map((face) => face.key));
  const faceKeysBySegmentId = getFaceKeysBySegmentId(deriveVectorFaces(node));

  return [...faceKeysBySegmentId.entries()]
    .filter(([, faceKeys]) => [...faceKeys].every((faceKey) => touchedFaceKeys.has(faceKey)))
    .map(([segmentId]) => segmentId);
};
