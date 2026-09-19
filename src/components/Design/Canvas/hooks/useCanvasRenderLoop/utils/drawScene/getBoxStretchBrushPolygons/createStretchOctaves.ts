// types
import { TStretchOctave } from './types';

// others
import { OCTAVES } from './constants';
import { STROKE_BRUSH_MAX_SAMPLES } from 'constant/strokeBrush';

// utils
import { clamp } from 'utils/math/clamp';
import { createNoiseValues } from './createNoiseValues';

export const createStretchOctaves = (random: () => number, perimeter: number, baseWavelength: number): TStretchOctave[] =>
  OCTAVES.map(({ amplitude, scale, smoothen, stepped }) => {
    const wavelength = Math.max(baseWavelength * scale, (perimeter * 4) / STROKE_BRUSH_MAX_SAMPLES);
    const count = clamp(Math.round(perimeter / wavelength), 2, STROKE_BRUSH_MAX_SAMPLES);

    return { amplitude, smoothen, stepped, values: createNoiseValues(random, count), wavelength: perimeter / count };
  });
