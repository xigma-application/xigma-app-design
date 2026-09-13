// others
import { MAX_GRADIENT_STOPS } from 'constant/webgl/vectorGradientFillConstants';

// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { hexToRgbaFloat } from '../hexToRgbaFloat';

export type TGradientStopUniforms = { colors: Float32Array; count: number; positions: Float32Array };

export const getGradientStopUniformArrays = (stops: TGradientStop[]): TGradientStopUniforms => {
  const clampedStops = stops.slice(0, MAX_GRADIENT_STOPS);
  const colors = new Float32Array(MAX_GRADIENT_STOPS * 4);
  const positions = new Float32Array(MAX_GRADIENT_STOPS);

  clampedStops.forEach((stop, index) => {
    const [r, g, b, a] = hexToRgbaFloat(stop.color, stop.opacity / 100);

    colors.set([r, g, b, a], index * 4);
    positions[index] = stop.position;
  });

  return { colors, count: clampedStops.length, positions };
};
