// types
import { AlignmentHorizontal } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';
import { TConstraintGuideParent, TLocalSegment } from './types';
import { TPoint } from 'types/canvas';

export const getHorizontalLocalSegment = (
  value: AlignmentHorizontal,
  local: TPoint,
  centre: TPoint,
  child: TBoxSceneNode,
  parent: TConstraintGuideParent,
): TLocalSegment => {
  switch (value) {
    case AlignmentHorizontal.right:
      return { from: { x: local.x + child.width, y: centre.y }, to: { x: parent.width, y: centre.y } };
    case AlignmentHorizontal.center:
      return { from: { x: centre.x - child.width / 4, y: centre.y }, to: { x: centre.x + child.width / 4, y: centre.y } };
    default:
      return { from: { x: local.x, y: centre.y }, to: { x: 0, y: centre.y } };
  }
};
