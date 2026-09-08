// types
import { AlignmentVertical } from 'types/design/enums';
import { TChildLocalExtent, TConstraintGuideParent, TLocalSegment } from './types';

export const getVerticalLocalSegment = (
  value: AlignmentVertical,
  extent: TChildLocalExtent,
  parent: TConstraintGuideParent,
): TLocalSegment => {
  const { centre, halfY } = extent;

  switch (value) {
    case AlignmentVertical.bottom:
      return { from: { x: centre.x, y: centre.y + halfY }, to: { x: centre.x, y: parent.height } };
    case AlignmentVertical.center:
      return { from: { x: centre.x, y: centre.y - halfY / 2 }, to: { x: centre.x, y: centre.y + halfY / 2 } };
    default:
      return { from: { x: centre.x, y: centre.y - halfY }, to: { x: centre.x, y: 0 } };
  }
};
