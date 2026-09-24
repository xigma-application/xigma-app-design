// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getAxisSpan } from '../../../PositionSection/ColumnAlignment/hooks/utils/getAxisSpan';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';

export const getSpacingOrder = (items: TSceneNode[], axis: TSpacingAxis): TSceneNode[] =>
  [...items].sort(
    (nodeA, nodeB) => getAxisSpan(getRotatedNodeBounds(nodeA), axis).start - getAxisSpan(getRotatedNodeBounds(nodeB), axis).start,
  );
