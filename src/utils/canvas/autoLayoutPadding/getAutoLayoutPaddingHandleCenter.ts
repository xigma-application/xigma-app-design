// types
import { TAutoLayoutPaddingSide } from './types';
import { TDraftRect, TPoint } from 'types/canvas';

const CENTER_BY_SIDE: Record<TAutoLayoutPaddingSide, (frame: TDraftRect, inset: number) => TPoint> = {
  bottom: (frame, inset) => ({ x: frame.x + frame.width / 2, y: frame.y + frame.height - inset }),
  left: (frame, inset) => ({ x: frame.x + inset, y: frame.y + frame.height / 2 }),
  right: (frame, inset) => ({ x: frame.x + frame.width - inset, y: frame.y + frame.height / 2 }),
  top: (frame, inset) => ({ x: frame.x + frame.width / 2, y: frame.y + inset }),
};

export const getAutoLayoutPaddingHandleCenter = (frame: TDraftRect, side: TAutoLayoutPaddingSide, inset: number): TPoint =>
  CENTER_BY_SIDE[side](frame, inset);
