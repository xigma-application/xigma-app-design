// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from './deriveVectorFaces';
import { getPolygonCentroid } from 'utils/math/getPolygonCentroid';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

const facesOverlap = (a: TVectorFace, b: TVectorFace): boolean =>
  isPointInPolygonVertices(getPolygonCentroid(a.points), b.points) || isPointInPolygonVertices(getPolygonCentroid(b.points), a.points);

export const remapFilledFaceKeys = (oldNode: TVectorNode, newNode: TVectorNode): string[] => {
  if (oldNode.filledFaceKeys.length === 0) {
    return newNode.filledFaceKeys;
  }

  const newFaces = deriveVectorFaces(newNode);
  const newFaceKeys = new Set(newFaces.map((face) => face.key));
  const stillValidKeys = oldNode.filledFaceKeys.filter((key) => newFaceKeys.has(key));
  const staleKeys = oldNode.filledFaceKeys.filter((key) => !newFaceKeys.has(key));

  if (staleKeys.length === 0) {
    return newNode.filledFaceKeys;
  }

  const staleOldFaces = deriveVectorFaces(oldNode).filter((face) => staleKeys.includes(face.key));
  const remappedKeys = newFaces
    .filter((newFace) => staleOldFaces.some((oldFace) => facesOverlap(oldFace, newFace)))
    .map((face) => face.key);

  return Array.from(new Set([...stillValidKeys, ...remappedKeys]));
};
