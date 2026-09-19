export type TBrushStretchPreset = { holes: number; roughness: number; taperEnd: number; wavelength: number };

const TAPER_END = [0.4, 0.55, 0.3, 0.7, 0.45, 0.25, 0.6, 0.5, 0.35, 0.8, 0.4, 0.65, 0.3, 0.55, 0.45];
const ROUGHNESS = [0.3, 0.16, 0.35, 0.13, 0.29, 0.4, 0.19, 0.22, 0.32, 0.1, 0.24, 0.16, 0.38, 0.19, 0.29];
const WAVELENGTH = [0.6, 0.7, 0.35, 0.9, 0.45, 0.3, 0.6, 0.55, 0.4, 1, 0.5, 0.8, 0.35, 0.6, 0.45];
const HOLES = [0.6, 0.2, 0.8, 0.1, 0.5, 0.9, 0.3, 0.4, 0.7, 0, 0.5, 0.2, 0.85, 0.3, 0.6];

export const getBrushStretchPreset = (index: number): TBrushStretchPreset => {
  const slot = ((index % TAPER_END.length) + TAPER_END.length) % TAPER_END.length;
  return { holes: HOLES[slot], roughness: ROUGHNESS[slot], taperEnd: TAPER_END[slot], wavelength: WAVELENGTH[slot] };
};
