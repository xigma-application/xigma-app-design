// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getCenteredMediaRect = (point: TPoint, naturalWidth: number, naturalHeight: number): TDraftRect => ({
  height: naturalHeight,
  width: naturalWidth,
  x: point.x - naturalWidth / 2,
  y: point.y - naturalHeight / 2,
});
