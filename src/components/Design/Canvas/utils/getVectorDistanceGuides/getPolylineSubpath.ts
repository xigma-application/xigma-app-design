// types
import { TPoint } from 'types/canvas';

const EPS = 1e-6;

export const getPolylineSubpath = (polyline: TPoint[], foot: TPoint, lengthFromStart: number, toEnd: 'end' | 'start'): TPoint[] => {
  const cumulative = [0];

  for (let index = 1; index < polyline.length; index += 1) {
    cumulative[index] =
      cumulative[index - 1] + Math.hypot(polyline[index].x - polyline[index - 1].x, polyline[index].y - polyline[index - 1].y);
  }

  if (toEnd === 'start') {
    const between = polyline.filter((_, index) => index > 0 && cumulative[index] < lengthFromStart - EPS);

    return [foot, ...between.reverse(), polyline[0]];
  }

  const between = polyline.filter((_, index) => index < polyline.length - 1 && cumulative[index] > lengthFromStart + EPS);

  return [foot, ...between, polyline[polyline.length - 1]];
};
