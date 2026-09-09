export const getDistributedGap = (availableSpace: number, itemsTotalSize: number, itemCount: number, clampToZero = true): number => {
  if (itemCount > 1) {
    const gap = (availableSpace - itemsTotalSize) / (itemCount - 1);
    return clampToZero ? Math.max(0, gap) : gap;
  }

  return 0;
};
