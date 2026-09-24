export const fitGridTrackCount = (fixedCount: number, otherCount: number, requiredCells: number): number =>
  Math.max(otherCount, Math.ceil(requiredCells / Math.max(fixedCount, 1)));
