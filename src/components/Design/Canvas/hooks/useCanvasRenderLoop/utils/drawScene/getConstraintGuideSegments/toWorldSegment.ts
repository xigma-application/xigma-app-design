// store
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';

// types
import { TConstraintGuideParent, TLocalSegment } from './types';
import { TLineSegment } from 'types/canvas';

export const toWorldSegment = (segment: TLocalSegment, parent: TConstraintGuideParent): TLineSegment => {
  const from = getNodeAbsoluteFromParentPosition(segment.from, parent);
  const to = getNodeAbsoluteFromParentPosition(segment.to, parent);

  return { x1: from.x, x2: to.x, y1: from.y, y2: to.y };
};
