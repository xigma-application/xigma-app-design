export const isAxisAlignedRotation = (rotation: number): boolean => Number.isFinite(rotation) && ((rotation % 90) + 90) % 90 === 0;
