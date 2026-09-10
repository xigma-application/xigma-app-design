export const readGridTrackRects = (trackCount: number, rows: Map<number, HTMLElement>): (DOMRect | null)[] =>
  Array.from({ length: trackCount }, (_unused, index) => rows.get(index)?.getBoundingClientRect() ?? null);
