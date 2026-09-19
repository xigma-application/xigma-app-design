// types
import { TStretchOctave } from './types';

// others
import { STROKE_BRUSH_MAX_SAMPLES } from 'constant/strokeBrush';

export const getStretchStep = (octaves: TStretchOctave[], perimeter: number): number =>
  Math.max(Math.min(...octaves.map((octave) => octave.wavelength)) / 2, perimeter / STROKE_BRUSH_MAX_SAMPLES);
