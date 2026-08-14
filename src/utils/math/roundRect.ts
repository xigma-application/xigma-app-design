// types
import { TDraftRect } from 'types/canvas';

export const roundRect = (rect: TDraftRect): TDraftRect => ({
  height: Math.round(rect.height),
  width: Math.round(rect.width),
  x: Math.round(rect.x),
  y: Math.round(rect.y),
});
