// types
import { TSurvivingFace } from '../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../deriveVectorFaces/deriveVectorFaces';
import { getPolygonCentroid } from './getPolygonCentroid';
import { getVectorFaceAtPoint } from 'components/Design/Canvas/utils/getVectorFaceAtPoint';
import { getVectorFillLoopKey } from '../../getVectorFillLoopKey';

export const resolveVectorCutFilledFaceKeys = (
  resultNode: TVectorNode,
  originalNode: TVectorNode,
  isolatedStubIds: Set<string>,
): TSurvivingFace[] => {
  const originalFilledFaceKeySet = new Set(originalNode.filledFaceKeys);

  return deriveVectorFaces(resultNode)
    .filter((face) => !face.pieceKeys.some((key) => isolatedStubIds.has(key.split('[')[0])))
    .map((face) => {
      const originalFace = getVectorFaceAtPoint(getPolygonCentroid(face.points), originalNode);
      const originalKey = originalFace && getVectorFillLoopKey(originalFace.pieceKeys);

      return originalKey && originalFilledFaceKeySet.has(originalKey) ? { key: getVectorFillLoopKey(face.pieceKeys), originalKey } : null;
    })
    .filter((survivor): survivor is TSurvivingFace => survivor !== null);
};
