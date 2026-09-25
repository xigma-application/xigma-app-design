// types
import { StrokeDashCap } from 'types/design/enums';
import { TLineFrame } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getLineFramePoint } from './getLineFramePoint';

const ROUND_CAP_SEGMENTS = 8;

const getRoundCap = (frame: TLineFrame, distance: number, direction: 1 | -1): TPoint[] =>
  Array.from({ length: ROUND_CAP_SEGMENTS - 1 }, (_, index) => {
    const angle = (Math.PI * (index + 1)) / ROUND_CAP_SEGMENTS;

    return getLineFramePoint(
      frame,
      distance + direction * Math.sin(angle) * frame.halfWidth,
      direction * Math.cos(angle) * frame.halfWidth,
    );
  });

export const getLineDashPolygon = (frame: TLineFrame, from: number, to: number, cap: StrokeDashCap): TPoint[] => {
  const extension = cap === StrokeDashCap.square ? frame.halfWidth : 0;
  const start = from - extension;
  const end = to + extension;
  const { halfWidth } = frame;

  return [
    getLineFramePoint(frame, start, halfWidth),
    getLineFramePoint(frame, end, halfWidth),
    ...(cap === StrokeDashCap.round ? getRoundCap(frame, end, 1) : []),
    getLineFramePoint(frame, end, -halfWidth),
    getLineFramePoint(frame, start, -halfWidth),
    ...(cap === StrokeDashCap.round ? getRoundCap(frame, start, -1) : []),
  ];
};
