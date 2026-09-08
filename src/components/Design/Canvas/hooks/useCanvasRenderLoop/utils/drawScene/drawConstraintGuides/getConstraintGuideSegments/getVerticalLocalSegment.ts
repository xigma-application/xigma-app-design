// types
import { AlignmentVertical } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';
import { TConstraintGuideParent, TLocalSegment } from './types';
import { TPoint } from 'types/canvas';

export const getVerticalLocalSegment = (
  value: AlignmentVertical,
  local: TPoint,
  centre: TPoint,
  child: TBoxSceneNode,
  parent: TConstraintGuideParent,
): TLocalSegment => {
  switch (value) {
    case AlignmentVertical.bottom:
      return { from: { x: centre.x, y: local.y + child.height }, to: { x: centre.x, y: parent.height } };
    case AlignmentVertical.center:
      return { from: { x: centre.x, y: centre.y - child.height / 4 }, to: { x: centre.x, y: centre.y + child.height / 4 } };
    default:
      return { from: { x: centre.x, y: local.y }, to: { x: centre.x, y: 0 } };
  }
};
