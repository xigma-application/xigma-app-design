// store
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';
import { TConstraintGuideParent } from './types';
import { TLineSegment } from 'types/canvas';

// utils
import { getHorizontalLocalSegment } from './getHorizontalLocalSegment';
import { getVerticalLocalSegment } from './getVerticalLocalSegment';
import { toWorldSegment } from './toWorldSegment';

export const getConstraintGuideSegments = (
  child: TBoxSceneNode,
  parent: TConstraintGuideParent,
  alignment: { horizontal?: AlignmentHorizontal; vertical?: AlignmentVertical } | undefined,
): TLineSegment[] => {
  const local = getNodePositionInParent({ x: child.x, y: child.y }, parent);
  const centre = { x: local.x + child.width / 2, y: local.y + child.height / 2 };
  const horizontal = alignment?.horizontal ?? AlignmentHorizontal.left;
  const vertical = alignment?.vertical ?? AlignmentVertical.top;

  return [
    toWorldSegment(getHorizontalLocalSegment(horizontal, local, centre, child, parent), parent),
    toWorldSegment(getVerticalLocalSegment(vertical, local, centre, child, parent), parent),
  ];
};
