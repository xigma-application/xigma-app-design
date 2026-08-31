// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

export const getRingFilledFaceKeys = (node: TVectorNode, bridgeIds: string[]): string[] =>
  deriveVectorFaces(node)
    .filter((face) => bridgeIds.some((bridgeId) => face.pieceKeys.some((pieceKey) => pieceKey.includes(bridgeId))))
    .map((face) => getVectorFillLoopKey(face.pieceKeys));
