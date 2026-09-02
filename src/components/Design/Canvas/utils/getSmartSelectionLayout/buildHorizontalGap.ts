// types
import { TSmartSelectionGap, TSmartSelectionNode } from 'types/design/smartSelection/types';

export const buildHorizontalGap = (
  before: TSmartSelectionNode,
  after: TSmartSelectionNode,
  index: number,
  value: number,
): TSmartSelectionGap => {
  const top = Math.max(before.bounds.y, after.bounds.y);
  const bottom = Math.min(before.bounds.y + before.bounds.height, after.bounds.y + after.bounds.height);
  const midX = (before.bounds.x + before.bounds.width + after.bounds.x) / 2;
  const midY = (top + bottom) / 2;

  return { index, midpoint: { x: midX, y: midY }, span: { x1: midX, x2: midX, y1: top, y2: bottom }, value };
};
