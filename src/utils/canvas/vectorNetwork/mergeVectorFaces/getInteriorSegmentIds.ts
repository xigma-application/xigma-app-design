// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from '../deriveVectorFaces/deriveVectorFaces';
import { getFaceKeysBySegmentId } from './getFaceKeysBySegmentId';

export const getInteriorSegmentIds = (node: TVectorNode, touchedFaces: TVectorFace[]): string[] => {
  const touchedFaceKeys = new Set(touchedFaces.map((face) => face.key));
  const faceKeysBySegmentId = getFaceKeysBySegmentId(deriveVectorFaces(node));

  return [...faceKeysBySegmentId.entries()]
    .filter(([, faceKeys]) => faceKeys.size === 2 && [...faceKeys].every((faceKey) => touchedFaceKeys.has(faceKey)))
    .map(([segmentId]) => segmentId);
};
