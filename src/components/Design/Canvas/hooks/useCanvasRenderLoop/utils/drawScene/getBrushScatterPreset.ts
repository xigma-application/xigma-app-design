export type TBrushScatterPreset = { aspect: number; dotScale: number; dots: number; sigma: number };

const DOTS = [220, 120, 300, 160, 200, 90, 260, 140, 180, 110];
const DOT_SCALE = [1, 1.6, 0.8, 1.3, 1, 2, 0.7, 1.5, 1.1, 1.8];
const SIGMA = [0.22, 0.2, 0.25, 0.18, 0.23, 0.16, 0.26, 0.19, 0.21, 0.17];
const ASPECT = [1, 1, 1, 1.5, 1, 1, 1, 1, 1, 1];

export const getBrushScatterPreset = (index: number): TBrushScatterPreset => {
  const slot = ((index % DOTS.length) + DOTS.length) % DOTS.length;
  return { aspect: ASPECT[slot], dotScale: DOT_SCALE[slot], dots: DOTS[slot], sigma: SIGMA[slot] };
};
