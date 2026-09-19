export const HOLE_POINTS = 8;
export const HOLE_LATERAL = 0.4;
export const HOLE_SPACING = 2.5;
export const HOLE_ALONG_MIN = 0.1;
export const HOLE_ALONG_SPAN = 0.2;
export const HOLE_ACROSS_MIN = 0.06;
export const HOLE_ACROSS_SPAN = 0.08;
export const THIN_ROUGHNESS_BOOST = 1.5;
export const OCTAVES = [
  { amplitude: 0.45, scale: 2.5, smoothen: 0.12, stepped: true },
  { amplitude: 0.3, scale: 0.8, smoothen: 0.2, stepped: true },
  { amplitude: 0.1, scale: 0.12, smoothen: 0, stepped: false },
] as const;
