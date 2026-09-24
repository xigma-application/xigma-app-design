// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getBooleanNoisePoints = ({ height, width, x, y }: TDraftRect): TPoint[] => [
  { x, y },
  { x: x + width, y },
  { x: x + width, y: y + height },
  { x, y: y + height },
];
