// types
import { TLineNetworkCrossing } from '../types';

// utils
import { getRealSegmentId } from './getRealSegmentId';
import { getRealSegmentIdsForLoopKey } from './getRealSegmentIdsForLoopKey';

const groupLineTsByRealSegmentId = (crossings: TLineNetworkCrossing[]): Map<string, Set<number>> => {
  const lineTsByRealSegmentId = new Map<string, Set<number>>();

  crossings.forEach((crossing) => {
    const realSegmentId = getRealSegmentId(crossing.segmentId);
    const lineTs = lineTsByRealSegmentId.get(realSegmentId) ?? new Set<number>();

    lineTs.add(crossing.lineT);
    lineTsByRealSegmentId.set(realSegmentId, lineTs);
  });

  return lineTsByRealSegmentId;
};

const groupOpenEndIdsByLineT = (openEndIds: string[], vertexLineT: Record<string, number>): Map<number, string[]> => {
  const openEndIdsByLineT = new Map<number, string[]>();

  openEndIds.forEach((id) => {
    const lineT = vertexLineT[id];
    openEndIdsByLineT.set(lineT, [...(openEndIdsByLineT.get(lineT) ?? []), id]);
  });

  return openEndIdsByLineT;
};

export const collectClosingPairKeys = (
  originalFilledFaceKeys: string[],
  crossings: TLineNetworkCrossing[],
  openEndIds: string[],
  vertexLineT: Record<string, number>,
): Set<string> => {
  const closingPairKeys = new Set<string>();
  const lineTsByRealSegmentId = groupLineTsByRealSegmentId(crossings);
  const openEndIdsByLineT = groupOpenEndIdsByLineT(openEndIds, vertexLineT);

  originalFilledFaceKeys.forEach((loopKey) => {
    const realSegmentIds = getRealSegmentIdsForLoopKey(loopKey);
    const faceLineTs = new Set<number>();

    realSegmentIds.forEach((realSegmentId) => {
      (lineTsByRealSegmentId.get(realSegmentId) ?? new Set<number>()).forEach((lineT) => faceLineTs.add(lineT));
    });

    const faceOpenEndIds = [...faceLineTs].flatMap((lineT) => openEndIdsByLineT.get(lineT) ?? []);
    const canPair = faceOpenEndIds.length > 0 && faceOpenEndIds.length % 2 === 0;

    if (canPair) {
      const sortedFaceOpenEndIds = [...faceOpenEndIds].sort((a, b) => vertexLineT[a] - vertexLineT[b]);

      for (let i = 0; i < sortedFaceOpenEndIds.length; i += 2) {
        closingPairKeys.add([sortedFaceOpenEndIds[i], sortedFaceOpenEndIds[i + 1]].sort().join('|'));
      }
    }
  });

  return closingPairKeys;
};
