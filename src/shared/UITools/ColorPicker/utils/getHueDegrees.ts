// types
import { TRgb } from 'types/color';

export const getHueDegrees = ({ b, g, r }: TRgb): number => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    switch (max) {
      case rNorm:
        hue = 60 * (((gNorm - bNorm) / delta) % 6);
        break;
      case gNorm:
        hue = 60 * ((bNorm - rNorm) / delta + 2);
        break;
      default:
        hue = 60 * ((rNorm - gNorm) / delta + 4);
    }
  }

  return hue < 0 ? hue + 360 : hue;
};
