export const isRangeInside = (outerStart: number, outerEnd: number, innerStart: number, innerEnd: number): boolean =>
  outerStart <= innerStart && outerEnd >= innerEnd;
