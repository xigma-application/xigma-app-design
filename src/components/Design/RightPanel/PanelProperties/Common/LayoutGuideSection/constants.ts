// @xigma
import { TIconProps } from '@xigma/components';

// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.layoutGuideSection`;

export const LAYOUT_GUIDE_ICONS: Record<LayoutGuideType, TIconProps['name']> = {
  [LayoutGuideType.columns]: 'LayoutGuideColumns',
  [LayoutGuideType.grid]: 'LayoutGuideGrid',
  [LayoutGuideType.rows]: 'LayoutGuideRows',
};

export const LAYOUT_GUIDE_MENU_TYPES: LayoutGuideType[] = [LayoutGuideType.grid, LayoutGuideType.columns, LayoutGuideType.rows];

export const NO_LAYOUT_GUIDES: TLayoutGuide[] = [];
