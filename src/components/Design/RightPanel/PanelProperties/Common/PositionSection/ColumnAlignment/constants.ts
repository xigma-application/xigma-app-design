// @xigma
import { TIconProps } from '@xigma/components';

// others
import {
  ARRANGE_MENU_ALIGN_BOTTOM_KEY,
  ARRANGE_MENU_ALIGN_HORIZONTAL_CENTERS_KEY,
  ARRANGE_MENU_ALIGN_LEFT_KEY,
  ARRANGE_MENU_ALIGN_RIGHT_KEY,
  ARRANGE_MENU_ALIGN_TOP_KEY,
  ARRANGE_MENU_ALIGN_VERTICAL_CENTERS_KEY,
  ARRANGE_MENU_DISTRIBUTE_HORIZONTAL_SPACING_KEY,
  ARRANGE_MENU_DISTRIBUTE_VERTICAL_SPACING_KEY,
  ARRANGE_MENU_TIDY_UP_KEY,
} from 'components/Design/LeftPanel/NavRail/LogoMenu/ArrangeMenu/constants';
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TAlignmentOption, TDistributeOption, TTidyUpKind } from './types';

export const translationNameSpace = `${parentNameSpace}.columnAlignment`;

export const HORIZONTAL_ALIGNMENT_OPTIONS: TAlignmentOption[] = [
  { key: AlignmentHorizontal.left, labelKey: ARRANGE_MENU_ALIGN_LEFT_KEY, name: 'AlignHorizontalLeft', shortcutKey: 'alignLeft' },
  {
    key: AlignmentHorizontal.center,
    labelKey: ARRANGE_MENU_ALIGN_HORIZONTAL_CENTERS_KEY,
    name: 'AlignHorizontalCenter',
    shortcutKey: 'alignHorizontalCenters',
  },
  { key: AlignmentHorizontal.right, labelKey: ARRANGE_MENU_ALIGN_RIGHT_KEY, name: 'AlignHorizontalRight', shortcutKey: 'alignRight' },
];

export const VERTICAL_ALIGNMENT_OPTIONS: TAlignmentOption[] = [
  { key: AlignmentVertical.top, labelKey: ARRANGE_MENU_ALIGN_TOP_KEY, name: 'AlignVerticalTop', shortcutKey: 'alignTop' },
  {
    key: AlignmentVertical.center,
    labelKey: ARRANGE_MENU_ALIGN_VERTICAL_CENTERS_KEY,
    name: 'AlignVerticalCenter',
    shortcutKey: 'alignVerticalCenters',
  },
  { key: AlignmentVertical.bottom, labelKey: ARRANGE_MENU_ALIGN_BOTTOM_KEY, name: 'AlignVerticalBottom', shortcutKey: 'alignBottom' },
];

export const DISTRIBUTE_OPTIONS: TDistributeOption[] = [
  { action: 'tidyUp', labelKey: ARRANGE_MENU_TIDY_UP_KEY, name: 'TidyUpVertical', shortcutKey: 'tidyUp' },
  {
    action: 'vertical',
    labelKey: ARRANGE_MENU_DISTRIBUTE_VERTICAL_SPACING_KEY,
    name: 'DistributeVerticalSpacing',
    shortcutKey: 'distributeVerticalSpacing',
  },
  {
    action: 'horizontal',
    labelKey: ARRANGE_MENU_DISTRIBUTE_HORIZONTAL_SPACING_KEY,
    name: 'DistributeHorizontalSpacing',
    shortcutKey: 'distributeHorizontalSpacing',
  },
];

export const DISTRIBUTE_MIN_CHILDREN = 3;

export const TIDY_UP_MIN_LAYERS = 2;

export const TIDY_UP_MAX_LAYERS = 99;

export const TIDY_UP_POSITION_EPSILON = 0.01;

export const DISTRIBUTE_MENU_TRIGGER_ICON: TIconProps['name'] = 'DistributeVerticalSpacing';

export const TIDY_UP_ICONS: Record<TTidyUpKind, TIconProps['name']> = {
  column: 'TidyUpVertical',
  grid: 'TidyUpGrid',
  row: 'TidyUpHorizontal',
};
