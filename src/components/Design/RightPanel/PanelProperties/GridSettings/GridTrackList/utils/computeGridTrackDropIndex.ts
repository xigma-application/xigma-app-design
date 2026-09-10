export const computeGridTrackDropIndex = (rects: (DOMRect | null)[], clientY: number): number =>
  rects.filter((rect): rect is DOMRect => rect !== null && clientY > rect.top + rect.height / 2).length;
