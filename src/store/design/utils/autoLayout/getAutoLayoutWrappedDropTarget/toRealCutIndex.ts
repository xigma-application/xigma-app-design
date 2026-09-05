export const toRealCutIndex = (cutIndex: number, originalIndex: number | null): number =>
  originalIndex !== null && cutIndex > originalIndex ? cutIndex - 1 : cutIndex;
