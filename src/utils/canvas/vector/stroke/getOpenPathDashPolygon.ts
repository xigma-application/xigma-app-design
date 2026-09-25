// others
import { OPEN_PATH_ROUND_CAP_SEGMENTS } from './constants';

// types
import { StrokeDashCap } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/types';

// utils
import { getStrokeRingPoint } from './getStrokeRingPoint';

const getRoundCap = (ring: TStrokeRing, distance: number, halfWidth: number, direction: 1 | -1): TPoint[] =>
  Array.from({ length: OPEN_PATH_ROUND_CAP_SEGMENTS - 1 }, (_, index) => {
    const angle = (Math.PI * (index + 1)) / OPEN_PATH_ROUND_CAP_SEGMENTS;
    return getStrokeRingPoint(ring, distance + direction * Math.sin(angle) * halfWidth, direction * Math.cos(angle));
  });

export const getOpenPathDashPolygon = (ring: TStrokeRing, from: number, to: number, cap: StrokeDashCap, halfWidth: number): TPoint[] => {
  const extension = cap === StrokeDashCap.square ? halfWidth : 0;
  const start = from - extension;
  const end = to + extension;
  const distances = [start, ...ring.cumulative.filter((distance) => distance > start && distance < end), end];

  return [
    ...distances.map((distance) => getStrokeRingPoint(ring, distance, 1)),
    ...(cap === StrokeDashCap.round ? getRoundCap(ring, end, halfWidth, 1) : []),
    ...distances.map((distance) => getStrokeRingPoint(ring, distance, -1)).reverse(),
    ...(cap === StrokeDashCap.round ? getRoundCap(ring, start, halfWidth, -1) : []),
  ];
};
