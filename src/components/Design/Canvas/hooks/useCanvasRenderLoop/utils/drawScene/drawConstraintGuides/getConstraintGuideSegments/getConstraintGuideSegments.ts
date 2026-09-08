// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';
import { TConstraintGuideParent } from './types';
import { TLineSegment } from 'types/canvas';

// utils
import { getChildLocalExtent } from './getChildLocalExtent';
import { getHorizontalLocalSegment } from './getHorizontalLocalSegment';
import { getVerticalLocalSegment } from './getVerticalLocalSegment';
import { toWorldSegment } from './toWorldSegment';

export const getConstraintGuideSegments = (
  child: TBoxSceneNode,
  parent: TConstraintGuideParent,
  alignment: { horizontal?: AlignmentHorizontal; vertical?: AlignmentVertical } | undefined,
): TLineSegment[] => {
  const extent = getChildLocalExtent(child, parent);
  const horizontal = alignment?.horizontal ?? AlignmentHorizontal.left;
  const vertical = alignment?.vertical ?? AlignmentVertical.top;

  return [
    toWorldSegment(getHorizontalLocalSegment(horizontal, extent, parent), parent),
    toWorldSegment(getVerticalLocalSegment(vertical, extent, parent), parent),
  ];
};
