// positive when the two ranges share a span, zero or negative when they merely touch or have a gap
export const getOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number): number =>
  Math.min(aEnd, bEnd) - Math.max(aStart, bStart);
