// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFaceRealSegmentIds } from '../getVectorFaceRealSegmentIds';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

export const getFilledFacePieceKeySets = (node: TVectorNode, segmentIdSet: Set<string>): string[][] =>
  deriveVectorFaces(node)
    .filter((face) => node.filledFaceKeys.includes(getVectorFillLoopKey(face.pieceKeys)))
    .filter((face) => {
      const realSegmentIds = getVectorFaceRealSegmentIds(face);

      return realSegmentIds.length > 0 && realSegmentIds.every((id) => segmentIdSet.has(id));
    })
    .map((face) => face.pieceKeys);
