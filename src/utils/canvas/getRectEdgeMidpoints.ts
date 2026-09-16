// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getRectEdgeMidpoints = (rect: TDraftRect): [TPoint, TPoint, TPoint, TPoint] => [
  { x: rect.x + rect.width / 2, y: rect.y },
  { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
  { x: rect.x + rect.width / 2, y: rect.y + rect.height },
  { x: rect.x, y: rect.y + rect.height / 2 },
];
