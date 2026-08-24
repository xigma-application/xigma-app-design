// utils
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { remapPieceKey } from './remapPieceKey';

export const getDuplicatedFilledFaceKeys = (
  filledFacePieceKeySets: string[][],
  idMap: Map<string, string>,
  segmentIdMap: Map<string, string>,
): string[] =>
  filledFacePieceKeySets.map((pieceKeys) =>
    getVectorFillLoopKey(pieceKeys.map((pieceKey) => remapPieceKey(pieceKey, idMap, segmentIdMap))),
  );
