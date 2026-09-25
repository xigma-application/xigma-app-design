// @xigma
import { TIconProps } from '@xigma/components';

// others
import { POLYGON_MAX_SIDES, POLYGON_MIN_SIDES } from 'components/Design/Canvas/constants';

// types
import { NodeType } from 'types/design/enums';
import { TCountNodeType } from './types';

export const COUNT_MAX = POLYGON_MAX_SIDES;
export const COUNT_MIN = POLYGON_MIN_SIDES;

export const COUNT_ICONS: Record<TCountNodeType, TIconProps['name']> = {
  [NodeType.polygon]: 'Count',
  [NodeType.star]: 'CountStar',
};
