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
import { TAlignmentOption, TDistributeOption } from './types';

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
  { labelKey: ARRANGE_MENU_TIDY_UP_KEY, name: 'TidyUp', shortcutKey: 'tidyUp' },
  {
    axis: 'vertical',
    labelKey: ARRANGE_MENU_DISTRIBUTE_VERTICAL_SPACING_KEY,
    name: 'DistributeVerticalSpacing',
    shortcutKey: 'distributeVerticalSpacing',
  },
  {
    axis: 'horizontal',
    labelKey: ARRANGE_MENU_DISTRIBUTE_HORIZONTAL_SPACING_KEY,
    name: 'DistributeHorizontalSpacing',
    shortcutKey: 'distributeHorizontalSpacing',
  },
];

export const DISTRIBUTE_MIN_CHILDREN = 3;
