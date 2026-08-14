// types
import { TDraftRect, TEditingTextBox } from 'types/canvas';

// utils
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';

export const flipRect = (rect: TDraftRect, box: TEditingTextBox): TDraftRect => {
  const topLeft = flipTextPoint({ x: rect.x, y: rect.y }, box);
  const bottomRight = flipTextPoint({ x: rect.x + rect.width, y: rect.y + rect.height }, box);

  return {
    height: Math.abs(bottomRight.y - topLeft.y),
    width: Math.abs(bottomRight.x - topLeft.x),
    x: Math.min(topLeft.x, bottomRight.x),
    y: Math.min(topLeft.y, bottomRight.y),
  };
};
