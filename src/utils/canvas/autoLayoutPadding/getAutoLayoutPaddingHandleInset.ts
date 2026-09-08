export const getAutoLayoutPaddingHandleInset = (
  paddingValue: number,
  maxInset: number,
  zeroStateOffset: number,
  isDragging: boolean,
): number => (paddingValue > 0 || isDragging ? Math.min(paddingValue / 2, maxInset) : Math.min(zeroStateOffset, maxInset));
