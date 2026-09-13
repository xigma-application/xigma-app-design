// types
import { TPoint } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';

// utils
import { lerp } from 'utils/math/lerp';

const STOP_HANDLE_OFFSET_PX = 18;

export const getGradientStopHandlePositions = (start: TPoint, end: TPoint, stops: TGradientStop[], zoom: number): TPoint[] => {
  const offset = STOP_HANDLE_OFFSET_PX / zoom;

  return stops.map((stop) => ({
    x: lerp(start.x, end.x, stop.position),
    y: lerp(start.y, end.y, stop.position) - offset,
  }));
};
