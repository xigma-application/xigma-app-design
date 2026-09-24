// others
import { SPACING_EQUALITY_TOLERANCE } from '../../constants';

// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getAxisSpan } from '../../../PositionSection/ColumnAlignment/hooks/utils/getAxisSpan';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { getSpacingOrder } from './getSpacingOrder';

export const getSelectionSpacing = (items: TSceneNode[], axis: TSpacingAxis): number | 'mixed' => {
  const spans = getSpacingOrder(items, axis).map((node) => getAxisSpan(getRotatedNodeBounds(node), axis));
  const gaps = spans.slice(1).map((span, index) => span.start - (spans[index].start + spans[index].size));
  const isEven = gaps.every((gap) => Math.abs(gap - gaps[0]) < SPACING_EQUALITY_TOLERANCE);

  return isEven ? Math.round((gaps[0] ?? 0) * 100) / 100 : 'mixed';
};
