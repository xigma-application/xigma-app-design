// types
import { TLineNetworkCrossing } from '../types';

// utils
import { getRealSegmentId } from './getRealSegmentId';
import { getRealSegmentIdsForLoopKey } from './getRealSegmentIdsForLoopKey';

export const collectClosingPairKeys = (
  originalFilledFaceKeys: string[],
  crossings: TLineNetworkCrossing[],
  openEndIds: string[],
  vertexLineT: Record<string, number>,
): Set<string> => {
  const closingPairKeys = new Set<string>();

  originalFilledFaceKeys.forEach((loopKey) => {
    const realSegmentIds = getRealSegmentIdsForLoopKey(loopKey);
    const faceLineTs = new Set(
      crossings.filter((crossing) => realSegmentIds.has(getRealSegmentId(crossing.segmentId))).map((crossing) => crossing.lineT),
    );
    const faceOpenEndIds = openEndIds.filter((id) => faceLineTs.has(vertexLineT[id]));
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
