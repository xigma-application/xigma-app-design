export const transformCoord = (coord: number, anchor: number | null, scale: number): number =>
  anchor === null ? coord : anchor + (coord - anchor) * scale;
