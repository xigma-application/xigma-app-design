export const scaleAxis = (value: number, anchor: number | null, scale: number): number =>
  anchor === null ? value : anchor + (value - anchor) * scale;
