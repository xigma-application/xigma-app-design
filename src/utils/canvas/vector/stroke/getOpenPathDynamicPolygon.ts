// others
import { OPEN_PATH_DYNAMIC_MAX_SUBDIVISIONS } from './constants';
import { STROKE_DYNAMIC_MAX_CONTROL_POINTS, STROKE_DYNAMIC_MAX_SAMPLES } from 'constant/strokeDynamic';

// types
import { TPoint } from 'types/canvas';
import { TStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';
import { TStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/types';

// utils
import { clamp } from 'utils/math/clamp';
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getDynamicStrokeNoise } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getDynamicStrokeNoise';
import { getStrokeRingDistances } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getStrokeRingDistances';
import { getStrokeRingPoint } from './getStrokeRingPoint';

const getSubdivisions = (smoothen: number, controlPoints: number): number =>
  smoothen > 0 ? clamp(Math.floor(STROKE_DYNAMIC_MAX_SAMPLES / controlPoints), 1, OPEN_PATH_DYNAMIC_MAX_SUBDIVISIONS) : 1;

export const getOpenPathDynamicPolygon = (
  ring: TStrokeRing,
  { frequency, smoothen, wiggle }: TStrokeDynamicValues,
  seed: string,
  strokeWidth: number,
): TPoint[] | null => {
  if (frequency > 0) {
    const targetWavelength = (2 * strokeWidth) / (frequency / 100);
    const controlPoints = clamp(Math.round(ring.perimeter / targetWavelength), 2, STROKE_DYNAMIC_MAX_CONTROL_POINTS);
    const wavelength = ring.perimeter / controlPoints;
    const random = createSeededRandom(seed);
    const values = Array.from({ length: controlPoints }, () => random() * 2 - 1);
    const distances = getStrokeRingDistances(ring, wavelength / getSubdivisions(smoothen, controlPoints));
    const ratios = distances.map((distance) => (wiggle / 100) * 2 * getDynamicStrokeNoise(values, distance, wavelength, smoothen / 100));

    return [
      ...distances.map((distance, index) => getStrokeRingPoint(ring, distance, 1 + ratios[index])),
      ...distances.map((distance, index) => getStrokeRingPoint(ring, distance, ratios[index] - 1)).reverse(),
    ];
  }

  return null;
};
