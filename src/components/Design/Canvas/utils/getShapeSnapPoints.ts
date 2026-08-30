// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getShapeSnapPoints = (bounds: TDraftRect): TPoint[] => {
  const { height, width, x, y } = bounds;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return [
    { x, y },
    { x: centerX, y },
    { x: x + width, y },
    { x, y: centerY },
    { x: centerX, y: centerY },
    { x: x + width, y: centerY },
    { x, y: y + height },
    { x: centerX, y: y + height },
    { x: x + width, y: y + height },
  ];
};
