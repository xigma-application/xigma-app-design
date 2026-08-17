export const getCornerRadiusHandleEffectiveSetback = (
  cornerRadius: number,
  maxRadius: number,
  setbackMultiplier: number,
  zeroStateOffset: number,
  isDragging: boolean,
): number =>
  cornerRadius > 0 || isDragging
    ? Math.min(cornerRadius, maxRadius) * setbackMultiplier
    : Math.min(zeroStateOffset, maxRadius * setbackMultiplier);
