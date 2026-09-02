// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillLoopKey } from './getVectorFillLoopKey';
import { getVectorFillPieceKey } from './getVectorFillPieceKey';

export type TSegmentSplitInfo = {
  newSegmentId: string;
  newVertexId: string;
  originalEndId: string;
  originalSegmentId: string;
  originalStartId: string;
};

const PIECE_KEY_PATTERN = /^(.+)\[(.+)\|(.+)]$/;

const splitStalePieceKey = (pieceKey: string, split: TSegmentSplitInfo): string[] => {
  const match = PIECE_KEY_PATTERN.exec(pieceKey);

  if (!match) {
    return [pieceKey];
  }

  const [, segmentId, boundaryA, boundaryB] = match;
  const boundaries = new Set([boundaryA, boundaryB]);
  const isStale =
    segmentId === split.originalSegmentId && boundaries.has(`v:${split.originalStartId}`) && boundaries.has(`v:${split.originalEndId}`);

  if (!isStale) {
    return [pieceKey];
  }

  return [
    getVectorFillPieceKey(split.originalSegmentId, { end: `v:${split.newVertexId}`, start: `v:${split.originalStartId}` }),
    getVectorFillPieceKey(split.newSegmentId, { end: `v:${split.originalEndId}`, start: `v:${split.newVertexId}` }),
  ];
};

export const remapFilledFaceKeysAfterSegmentSplit = (
  filledFaceKeys: string[],
  fillByKey: Record<string, TPaint[]>,
  split: TSegmentSplitInfo,
): Pick<TVectorNode, 'filledFaceKeys' | 'fillByKey'> => {
  const nextFillByKey = { ...fillByKey };

  const nextFilledFaceKeys = filledFaceKeys.map((loopKey) => {
    const nextLoopKey = getVectorFillLoopKey(loopKey.split(',').flatMap((pieceKey) => splitStalePieceKey(pieceKey, split)));

    if (nextLoopKey !== loopKey && loopKey in nextFillByKey) {
      nextFillByKey[nextLoopKey] = nextFillByKey[loopKey];
      delete nextFillByKey[loopKey];
    }

    return nextLoopKey;
  });

  return { fillByKey: nextFillByKey, filledFaceKeys: nextFilledFaceKeys };
};
