export const getFlowReorderTargetIndex = (
  rawChildIds: string[],
  movedIds: string[],
  anchorId: string | undefined,
  position: 'after' | 'before',
): number => {
  const movedIdSet = new Set(movedIds);
  const postRemovalIds = rawChildIds.filter((id) => !movedIdSet.has(id));

  if (anchorId === undefined) {
    return postRemovalIds.length;
  }

  const anchorIndex = postRemovalIds.indexOf(anchorId);
  return position === 'before' ? anchorIndex : anchorIndex + 1;
};
