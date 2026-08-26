// types
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
): string[] =>
  deriveVectorFaces(resultNode)
    .filter((face) => !face.pieceKeys.some((key) => isolatedStubIds.has(key.split('[')[0])))
    .filter((face) => {
      const originalFace = getVectorFaceAtPoint(getPolygonCentroid(face.points), originalNode);

      return originalFace !== null && originalNode.filledFaceKeys.includes(getVectorFillLoopKey(originalFace.pieceKeys));
    })
    .map((face) => getVectorFillLoopKey(face.pieceKeys));
