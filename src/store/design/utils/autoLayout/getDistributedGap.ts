export const getDistributedGap = (availableSpace: number, itemsTotalSize: number, itemCount: number): number =>
  itemCount > 1 ? Math.max(0, (availableSpace - itemsTotalSize) / (itemCount - 1)) : 0;
