// types
import { TDraftRect } from 'types/canvas';
import { TStrokeSideWidths } from './types';

export const getPaddedRect = (rect: TDraftRect, paddings: TStrokeSideWidths): TDraftRect => ({
  height: rect.height + paddings.top + paddings.bottom,
  width: rect.width + paddings.left + paddings.right,
  x: rect.x - paddings.left,
  y: rect.y - paddings.top,
});
