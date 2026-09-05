// types
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TAxisAlign } from '../getAlignmentComponents';
import { TPoint } from 'types/canvas';

// utils
import { getAutoLayoutPrimaryAnchoredPosition } from '../getAutoLayoutPrimaryAnchoredPosition';

export const getAutoLayoutInsertedPosition = (
  isHorizontal: boolean,
  itemSpacing: number,
  primaryAlign: TAxisAlign,
  index: number,
  realPositions: TAutoLayoutChildPosition[],
  children: TAutoLayoutChildSize[],
  draggedSize: { height: number; width: number },
  simulatedPosition: TPoint,
): TPoint => {
  const previous = index > 0 ? { position: realPositions[index - 1], size: children[index - 1] } : null;
  const next = index < children.length ? { position: realPositions[index], size: children[index] } : null;

  return getAutoLayoutPrimaryAnchoredPosition(isHorizontal, itemSpacing, primaryAlign, previous, next, draggedSize, simulatedPosition);
};
