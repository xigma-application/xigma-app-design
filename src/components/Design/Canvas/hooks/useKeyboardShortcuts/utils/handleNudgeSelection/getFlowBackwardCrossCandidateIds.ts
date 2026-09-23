// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';

export type TFlowBackwardCrossCandidate = { blockAnchorId: string | undefined; candidateFlowIds: string[]; evictedIds: string[] };

const getLinePrimarySize = (
  lineIds: string[],
  sizesById: Map<string, TAutoLayoutChildSize>,
  isHorizontal: boolean,
  itemSpacing: number,
): number =>
  lineIds.reduce((total, id, index) => {
    const size = sizesById.get(id);
    const primarySize = size ? (isHorizontal ? size.width : size.height) : 0;

    return total + primarySize + (index > 0 ? itemSpacing : 0);
  }, 0);

const buildCandidate = (
  flowIds: string[],
  previousLineIds: string[],
  orderedSelectedIds: string[],
  keptPreviousLine: string[],
  evictedIds: string[],
  insertIndex: number,
): TFlowBackwardCrossCandidate => {
  const previousLineIdSet = new Set(previousLineIds);
  const selectedIdSet = new Set(orderedSelectedIds);
  const beforePreviousLine = previousLineIds.length > 0 ? flowIds.slice(0, flowIds.indexOf(previousLineIds[0])) : [];
  const rest = flowIds.filter((id) => !previousLineIdSet.has(id) && !selectedIdSet.has(id));
  const keptAfterInsertion = keptPreviousLine.slice(insertIndex);
  const newPreviousLine = [...keptPreviousLine.slice(0, insertIndex), ...orderedSelectedIds, ...keptAfterInsertion];
  const blockAnchorId = keptAfterInsertion[0] ?? evictedIds[0] ?? rest[0];

  return { blockAnchorId, candidateFlowIds: [...beforePreviousLine, ...newPreviousLine, ...evictedIds, ...rest], evictedIds };
};

export const getFlowBackwardCrossCandidateIds = (
  flowIds: string[],
  previousLineIds: string[],
  orderedSelectedIds: string[],
  blockIndexInOwnLine: number,
  sizesById: Map<string, TAutoLayoutChildSize>,
  isHorizontal: boolean,
  itemSpacing: number,
  availablePrimary: number,
): TFlowBackwardCrossCandidate | null => {
  const blockSize = getLinePrimarySize(orderedSelectedIds, sizesById, isHorizontal, itemSpacing);
  const fullPreviousLineSize = getLinePrimarySize(previousLineIds, sizesById, isHorizontal, itemSpacing);

  if (fullPreviousLineSize + (previousLineIds.length > 0 ? itemSpacing : 0) + blockSize <= availablePrimary) {
    return buildCandidate(flowIds, previousLineIds, orderedSelectedIds, previousLineIds, [], previousLineIds.length);
  }

  const targetIndex = Math.min(blockIndexInOwnLine, previousLineIds.length - 1);

  for (let evictCount = 1; evictCount <= previousLineIds.length - targetIndex; evictCount += 1) {
    const evictedIds = previousLineIds.slice(targetIndex, targetIndex + evictCount);
    const keptPreviousLine = [...previousLineIds.slice(0, targetIndex), ...previousLineIds.slice(targetIndex + evictCount)];
    const keptSize = getLinePrimarySize(keptPreviousLine, sizesById, isHorizontal, itemSpacing);
    const combinedSize = keptSize + (keptPreviousLine.length > 0 ? itemSpacing : 0) + blockSize;

    if (combinedSize <= availablePrimary) {
      return buildCandidate(flowIds, previousLineIds, orderedSelectedIds, keptPreviousLine, evictedIds, targetIndex);
    }
  }

  return null;
};
