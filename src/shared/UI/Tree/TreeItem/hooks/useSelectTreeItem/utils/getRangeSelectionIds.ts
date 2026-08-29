export const getRangeSelectionIds = (orderedIds: string[], anchorId: string, targetId: string): string[] => {
  const anchorIndex = orderedIds.indexOf(anchorId);
  const targetIndex = orderedIds.indexOf(targetId);
  const isRangeResolvable = anchorIndex !== -1 && targetIndex !== -1;

  if (isRangeResolvable) {
    const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];

    return orderedIds.slice(start, end + 1);
  }

  return [targetId];
};
