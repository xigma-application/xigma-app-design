// types
import { TSmartSelectionGap, TSmartSelectionNode } from 'types/design/smartSelection/types';

export const buildVerticalGap = (
  before: TSmartSelectionNode,
  after: TSmartSelectionNode,
  index: number,
  value: number,
): TSmartSelectionGap => {
  const left = Math.max(before.bounds.x, after.bounds.x);
  const right = Math.min(before.bounds.x + before.bounds.width, after.bounds.x + after.bounds.width);
  const midY = (before.bounds.y + before.bounds.height + after.bounds.y) / 2;
  const midX = (left + right) / 2;

  return { index, midpoint: { x: midX, y: midY }, span: { x1: left, x2: right, y1: midY, y2: midY }, value };
};
