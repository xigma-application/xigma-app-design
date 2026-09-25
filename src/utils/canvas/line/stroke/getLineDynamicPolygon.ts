// others
import { STROKE_DYNAMIC_MAX_CONTROL_POINTS, STROKE_DYNAMIC_MAX_SAMPLES } from 'constant/strokeDynamic';

// types
import { TLineFrame } from '../types';
import { TPoint } from 'types/canvas';
import { TStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';

// utils
import { clamp } from 'utils/math/clamp';
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getDynamicStrokeNoise } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getDynamicStrokeNoise';
import { getLineFramePoint } from './getLineFramePoint';

const MAX_SUBDIVISIONS = 8;

export const getLineDynamicPolygon = (
  frame: TLineFrame,
  { frequency, smoothen, wiggle }: TStrokeDynamicValues,
  seed: string,
): TPoint[] | null => {
  const strokeWidth = frame.halfWidth * 2;

  if (frequency > 0) {
    const targetWavelength = (2 * strokeWidth) / (frequency / 100);
    const controlPoints = clamp(Math.round(frame.length / targetWavelength), 2, STROKE_DYNAMIC_MAX_CONTROL_POINTS);
    const wavelength = frame.length / controlPoints;
    const random = createSeededRandom(seed);
    const values = Array.from({ length: controlPoints }, () => random() * 2 - 1);
    const subdivisions = smoothen > 0 ? clamp(Math.floor(STROKE_DYNAMIC_MAX_SAMPLES / controlPoints), 1, MAX_SUBDIVISIONS) : 1;
    const step = wavelength / subdivisions;
    const amplitude = (wiggle / 100) * strokeWidth;
    const distances = Array.from({ length: controlPoints * subdivisions + 1 }, (_, index) => Math.min(index * step, frame.length));
    const offsets = distances.map((distance) => amplitude * getDynamicStrokeNoise(values, distance, wavelength, smoothen / 100));

    return [
      ...distances.map((distance, index) => getLineFramePoint(frame, distance, frame.halfWidth + offsets[index])),
      ...distances.map((distance, index) => getLineFramePoint(frame, distance, offsets[index] - frame.halfWidth)).reverse(),
    ];
  }

  return null;
};
