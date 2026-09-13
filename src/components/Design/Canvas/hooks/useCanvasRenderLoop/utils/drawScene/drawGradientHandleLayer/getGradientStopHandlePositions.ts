// types
import { TPoint } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';

// utils
import { lerp } from 'utils/math/lerp';
import { normalizeVector } from 'utils/math/normalizeVector';

const STOP_HANDLE_OFFSET_PX = 14;

export const getGradientStopHandlePositions = (start: TPoint, end: TPoint, stops: TGradientStop[], zoom: number): TPoint[] => {
  const direction = normalizeVector({ x: end.x - start.x, y: end.y - start.y });
  const perpendicular: TPoint = { x: -direction.y, y: direction.x };
  const offset = STOP_HANDLE_OFFSET_PX / zoom;

  return stops.map((stop) => {
    const base: TPoint = { x: lerp(start.x, end.x, stop.position), y: lerp(start.y, end.y, stop.position) };
    return { x: base.x + perpendicular.x * offset, y: base.y + perpendicular.y * offset };
  });
};
