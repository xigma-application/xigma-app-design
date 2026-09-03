// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getRectCenter = (rect: TDraftRect): TPoint => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});
