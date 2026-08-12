// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getRectCorners = (rect: TDraftRect): [TPoint, TPoint, TPoint, TPoint] => [
  { x: rect.x, y: rect.y },
  { x: rect.x + rect.width, y: rect.y },
  { x: rect.x + rect.width, y: rect.y + rect.height },
  { x: rect.x, y: rect.y + rect.height },
];
