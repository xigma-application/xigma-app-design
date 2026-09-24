// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis, TSpacingSpan } from '../../types';

// utils
import { getAxisSpan } from '../../../PositionSection/ColumnAlignment/hooks/utils/getAxisSpan';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';

export const getSpacingGroupSpan = (group: TSceneNode[], axis: TSpacingAxis): TSpacingSpan =>
  group.reduce<TSpacingSpan>(
    (span, node) => {
      const { size, start } = getAxisSpan(getRotatedNodeBounds(node), axis);
      return { end: Math.max(span.end, start + size), start: Math.min(span.start, start) };
    },
    { end: -Infinity, start: Infinity },
  );
