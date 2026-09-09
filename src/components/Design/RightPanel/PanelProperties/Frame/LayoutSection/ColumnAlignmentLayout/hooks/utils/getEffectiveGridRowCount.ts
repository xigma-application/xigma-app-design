export const getEffectiveGridRowCount = (childCount: number, columnCount: number): number =>
  Math.max(Math.ceil(childCount / Math.max(columnCount, 1)), 1);
