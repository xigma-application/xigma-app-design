// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSelectionSpacing } from './getSelectionSpacing';
import { getSpacingCenterSpread } from './getSpacingCenterSpread';
import { getSpacingOverlapGroups } from './getSpacingOverlapGroups';

export const getFreeFormSpacingAxes = (items: TSceneNode[]): Record<TSpacingAxis, boolean> => {
  const isHorizontalApart = getSpacingOverlapGroups(items, 'horizontal').length > 1;
  const isVerticalApart = getSpacingOverlapGroups(items, 'vertical').length > 1;
  const isNeitherApart = !isHorizontalApart && !isVerticalApart;
  const isHorizontalWider = getSpacingCenterSpread(items, 'horizontal') >= getSpacingCenterSpread(items, 'vertical');

  return {
    horizontal: (isHorizontalApart || (isNeitherApart && isHorizontalWider)) && getSelectionSpacing(items, 'horizontal') !== 'mixed',
    vertical: (isVerticalApart || (isNeitherApart && !isHorizontalWider)) && getSelectionSpacing(items, 'vertical') !== 'mixed',
  };
};
