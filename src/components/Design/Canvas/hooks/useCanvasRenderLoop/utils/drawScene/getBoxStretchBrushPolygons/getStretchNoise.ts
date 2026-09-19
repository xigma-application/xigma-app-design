// types
import { TStretchOctave } from './types';

// utils
import { getDynamicStrokeNoise } from '../getDynamicStrokeNoise';
import { getSteppedStrokeNoise } from '../getSteppedStrokeNoise';

export const getStretchNoise = (octaves: TStretchOctave[], distance: number): number =>
  octaves.reduce(
    (total, octave) =>
      total +
      octave.amplitude *
        (octave.stepped
          ? getSteppedStrokeNoise(octave.values, distance, octave.wavelength, octave.smoothen)
          : getDynamicStrokeNoise(octave.values, distance, octave.wavelength, octave.smoothen)),
    0,
  );
