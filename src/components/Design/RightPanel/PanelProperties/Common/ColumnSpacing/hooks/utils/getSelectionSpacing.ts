// others
import { SPACING_EQUALITY_TOLERANCE } from '../../constants';

// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSpacingGroupSpan } from './getSpacingGroupSpan';
import { getSpacingGroups } from './getSpacingGroups';

export const getSelectionSpacing = (items: TSceneNode[], axis: TSpacingAxis): number | 'mixed' => {
  const spans = getSpacingGroups(items, axis).map((group) => getSpacingGroupSpan(group, axis));
  const gaps = spans.slice(1).map((span, index) => span.start - spans[index].end);
  const isEven = gaps.every((gap) => Math.abs(gap - gaps[0]) < SPACING_EQUALITY_TOLERANCE);

  return isEven ? Math.round((gaps[0] ?? 0) * 100) / 100 : 'mixed';
};
