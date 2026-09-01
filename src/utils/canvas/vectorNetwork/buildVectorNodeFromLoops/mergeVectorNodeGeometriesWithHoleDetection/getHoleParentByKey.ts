// types
import { TNodeFace } from './types';

// utils
import { facesOverlap } from './facesOverlap';
import { getContainingFace } from './getContainingFace';

export const getHoleParentByKey = (faces: TNodeFace[]): Record<string, string> => {
  const holeParentByKey: Record<string, string> = {};
  const containerKeys = new Set<string>();

  faces.forEach((face) => {
    const container = getContainingFace(face, faces);

    if (container) {
      holeParentByKey[face.key] = container.key;
      containerKeys.add(container.key);
    }
  });

  const remaining = faces.filter((face) => !(face.key in holeParentByKey) && !containerKeys.has(face.key));

  remaining.forEach((face) => {
    const overlapsAnother = faces.some((other) => facesOverlap(face, other));

    if (overlapsAnother) {
      holeParentByKey[face.key] = `__isolated__${face.key}`;
    }
  });

  return holeParentByKey;
};
