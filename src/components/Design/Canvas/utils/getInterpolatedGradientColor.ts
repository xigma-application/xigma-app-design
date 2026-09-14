// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { hexToRgb } from 'utils/color/hexToRgb';
import { rgbToHex } from 'utils/color/rgbToHex';

export const getInterpolatedGradientColor = (stops: TGradientStop[], position: number): { color: string; opacity: number } => {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const [firstStop] = sortedStops;
  const lastStop = sortedStops[sortedStops.length - 1];

  if (position <= firstStop.position) {
    return { color: firstStop.color, opacity: firstStop.opacity };
  }

  if (position >= lastStop.position) {
    return { color: lastStop.color, opacity: lastStop.opacity };
  }

  const endIndex = sortedStops.findIndex((stop) => stop.position >= position);
  const startStop = sortedStops[endIndex - 1];
  const endStop = sortedStops[endIndex];
  const span = endStop.position - startStop.position;
  const t = span > 0 ? (position - startStop.position) / span : 0;
  const startRgb = hexToRgb(startStop.color);
  const endRgb = hexToRgb(endStop.color);
  const color = rgbToHex({
    b: startRgb.b + (endRgb.b - startRgb.b) * t,
    g: startRgb.g + (endRgb.g - startRgb.g) * t,
    r: startRgb.r + (endRgb.r - startRgb.r) * t,
  });
  const opacity = startStop.opacity + (endStop.opacity - startStop.opacity) * t;

  return { color, opacity };
};
