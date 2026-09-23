export const buildFlowReorderCandidateIds = (
  flowIds: string[],
  orderedSelectedIds: string[],
  anchorId: string,
  position: 'after' | 'before',
): string[] => {
  const selectedIdSet = new Set(orderedSelectedIds);
  const remainingIds = flowIds.filter((id) => !selectedIdSet.has(id));
  const anchorIndex = remainingIds.indexOf(anchorId);
  const insertIndex = position === 'before' ? anchorIndex : anchorIndex + 1;

  return [...remainingIds.slice(0, insertIndex), ...orderedSelectedIds, ...remainingIds.slice(insertIndex)];
};
