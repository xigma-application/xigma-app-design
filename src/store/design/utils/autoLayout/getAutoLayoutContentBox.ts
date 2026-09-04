// types
import { TDraftRect } from 'types/canvas';

export type TAutoLayoutPadding = { paddingBottom: number; paddingLeft: number; paddingRight: number; paddingTop: number };

export const getAutoLayoutContentBox = (frame: TDraftRect, padding: TAutoLayoutPadding): TDraftRect => ({
  height: Math.max(frame.height - padding.paddingTop - padding.paddingBottom, 0),
  width: Math.max(frame.width - padding.paddingLeft - padding.paddingRight, 0),
  x: frame.x + padding.paddingLeft,
  y: frame.y + padding.paddingTop,
});
