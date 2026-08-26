// utils
import { TVectorFace } from '../deriveVectorFaces/deriveVectorFaces';

export const getFaceKeysBySegmentId = (faces: TVectorFace[]): Map<string, Set<string>> => {
  const faceKeysBySegmentId = new Map<string, Set<string>>();

  faces.forEach((face) => {
    face.key.split(',').forEach((segmentId) => {
      const faceKeys = faceKeysBySegmentId.get(segmentId) ?? new Set<string>();

      faceKeys.add(face.key);
      faceKeysBySegmentId.set(segmentId, faceKeys);
    });
  });

  return faceKeysBySegmentId;
};
