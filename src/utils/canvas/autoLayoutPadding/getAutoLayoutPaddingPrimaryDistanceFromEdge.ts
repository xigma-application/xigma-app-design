// types
import { TAutoLayoutPaddingSide } from './types';
import { TDraftRect, TPoint } from 'types/canvas';

const PRIMARY_DISTANCE_BY_SIDE: Record<TAutoLayoutPaddingSide, (frame: TDraftRect, point: TPoint) => number> = {
  bottom: (frame, point) => frame.y + frame.height - point.y,
  left: (frame, point) => point.x - frame.x,
  right: (frame, point) => frame.x + frame.width - point.x,
  top: (frame, point) => point.y - frame.y,
};

export const getAutoLayoutPaddingPrimaryDistanceFromEdge = (frame: TDraftRect, side: TAutoLayoutPaddingSide, point: TPoint): number =>
  PRIMARY_DISTANCE_BY_SIDE[side](frame, point);
