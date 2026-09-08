// types
import { AlignmentHorizontal } from 'types/design/enums';
import { TChildLocalExtent, TConstraintGuideParent, TLocalSegment } from './types';

export const getHorizontalLocalSegment = (
  value: AlignmentHorizontal,
  extent: TChildLocalExtent,
  parent: TConstraintGuideParent,
): TLocalSegment => {
  const { centre, halfX } = extent;

  switch (value) {
    case AlignmentHorizontal.right:
      return { from: { x: centre.x + halfX, y: centre.y }, to: { x: parent.width, y: centre.y } };
    case AlignmentHorizontal.center:
      return { from: { x: centre.x - halfX / 2, y: centre.y }, to: { x: centre.x + halfX / 2, y: centre.y } };
    default:
      return { from: { x: centre.x - halfX, y: centre.y }, to: { x: 0, y: centre.y } };
  }
};
